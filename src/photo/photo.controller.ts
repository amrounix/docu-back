
import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { rename } from 'fs';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { uploadRootPath } from 'src/utils/path.util';
import { PhotoModel } from './photo.model';
import { PhotoService } from './photo.service';

@Controller('docu')
export class PhotoController {
    // eslint-disable-next-line prettier/prettier
    constructor(private readonly _photoService: PhotoService) {}

    @Get('doc-enseigne/:enseigneId')
    getDocByEnseigneId(@Param('enseigneId') enseigneId): Promise<PhotoModel[]> {
      return this._photoService.findByEnseigne(enseigneId);
    }

    @Get('doc-influencer/:influencerId')
    getDocByInfluencerId(): Promise<PhotoModel[]> {
      return this._photoService.findAll();
    }


    @Get('img/:imgpath')
    seeUploadedFile(@Param('imgpath') image, @Res() res) {
      return res.sendFile(image, { root: uploadRootPath });
    }
  
    @Post('upload')
    @UseInterceptors(FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: join(uploadRootPath,'tmp'),
        filename: (req, file, cb) =>  {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname.toLowerCase())}`);
        },
      }),
      fileFilter : (req, file, cb) => {
        console.log(file.originalname);
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg)$/)) {
          console.log("not goood");
          return cb(new Error(`Only image files are allowed! ${file.originalname}`), false);
        }
  //      if (file.mimetype!=="image/jpeg")
        console.log("goood");
        cb(null, true);
      },
    }))
    async uploadFile(@Body('data') _data/* : FileFormDto */, 
      @UploadedFiles() fiches,
    ) {
  
      console.log("start recup");
      const data = JSON.parse(_data);
      console.dir(data);
      const photos : PhotoModel[] = (await this._photoService.findByEnseigne(1));
      const fichIds : number[] = data.map((mod) => mod['id']);
      
      photos.forEach((photo) => {
        if (!fichIds.includes(photo.id)) {
          //delete picture
          console.log(`remove ${photo.id} , delete file ${photo.filepath}`);
          photo.set({deleted : 1}).save();  
        } else {
          //update picture
          console.log(`update photo.id=${photo.id} with order=${data[fichIds.indexOf(photo.id)].newOrder}`);
          //update the order
          photo.set({order : data[fichIds.indexOf(photo.id)].newOrder}).save();  
        }
      });

      fiches.forEach(async (files) => {
        try {
          if (!files) {
            throw new BadRequestException('invalid file provided');
        }

        const data_ = data.find(item => item.source.indexOf(`/${files.originalname}`)>0);
        console.log(files.originalname+ " - "+ files.mimetype);
        console.log(files.filename);
        console.log(files.size);
    
        if (data_.enseigneId!=null) {
          await mkdir(join(uploadRootPath, `enseigne` ,`${data_.enseigneId}`), {recursive: true});
          await rename(join(uploadRootPath,'tmp',files.filename),join(uploadRootPath,`enseigne`, `${data_.enseigneId}`,files.filename), (err) => {  
            if (err) throw err;
            console.log('move complete!');
          });
      }

        if(data_.influencerId!=null) {
          await mkdir(join(uploadRootPath, `influencer` ,`${data_.influencerId}`), {recursive: true});
          await rename(join(uploadRootPath,'tmp',files.filename),join(uploadRootPath,`influencer`, `${data_.influencerId}`,files.filename), (err) => {  
            if (err) throw err;
          console.log('move complete!');
          });
      }

        await this._photoService.create({
          enseigneId: data_.enseigneId,
          influencerId: data_.influencerId,
          filepath: data_.influencerId!=null ? join( `ìnfluencer` , `${data_.influencerId}`,files.filename):join( `enseigne` , `${data_.enseigneId}`,files.filename) ,
          order: data_.newOrder,
          deleted: 0
        });
              return {success: true}
        }catch(err){
          throw err;
        }
    
      });
    }
  
  
      //return await creteUploadFile("sam.jpg", file.buffer);
      //console.log(file.buffer.toString());
  /*     return {
        body,
        file: file.buffer.toString(),
      };
   */  
  
/*    @Post('upload-check')
    @UseInterceptors(FileInterceptor('file'))
    uploadFileCheck(
      @Body() body: FileFormDto,
      @UploadedFile(
        new ParseFilePipeBuilder()
          .addFileTypeValidator({
            fileType: 'jpg',
          })
          .build({
            fileIsRequired: false,
          }),
      )
      file?: Express.Multer.File,
    ) {
      return {
        body,
        file: file?.buffer.toString(),
      };
    }
*/

}
