
import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream, rename } from 'fs';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { uploadRootPath } from 'src/utils/path.util';
import { PhotoModel } from './photo.model';
import { PhotoService } from './photo.service';
import { v4 } from 'uuid';

//import { fileTypeFromStream } from 'file-type/core';

@Controller('docu')
export class PhotoController {
    // eslint-disable-next-line prettier/prettier
    constructor(private readonly _photoService: PhotoService) {}

    @Get('doc-enseigne/:enseigneId')
    getDocByEnseigneId(@Param('enseigneId') enseigneId): Promise<PhotoModel[]> {
      return this._photoService.findByEnseigne(enseigneId);
    }

    @Get('doc-influencer/:influencerId')
    getDocByInfluencerId(@Param('influencerId') influencerId): Promise<PhotoModel[]> {
      return this._photoService.findByInfluencer(influencerId);
    }


    @Get('img/:imgpath')
    seeUploadedFile(@Param('imgpath') image, @Res() res) {
      return res.sendFile(image, { root: uploadRootPath });
    }
  
    @Get('img-profil')
    async importProfilPicture(@Param('imgurl') imgurl,@Param('uuid') uuid) {
    console.log(imgurl);
      const url_ = imgurl ??
      "https://scontent-fra5-2.cdninstagram.com/v/t51.2885-19/347726833_213810691445325_7230259483751815249_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-fra5-2.cdninstagram.com&_nc_cat=109&_nc_ohc=LW6JxEn4uckAX9k6hhH&edm=ACWDqb8BAAAA&ccb=7-5&oh=00_AfDIpeG9C419pQ7zzoBQ-e2ODxYTOeFh7dK3Uq0wShvhZg&oe=65612A9B&_nc_sid=ee9879";
      const token = uuid ?? v4();
      return await this._photoService.importProfilPicture(url_ , token);
      //return res.sendFile(image, { root: uploadRootPath });
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
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|pdf)$/)) {
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
      let photos : PhotoModel[] = [];
      
      if(data.enseigne){

          photos= (await this._photoService.findByEnseigne(data.enseigne));
         }
         
         if(data.influencer){
          photos= (await this._photoService.findByInfluencer(data.influencer));

         }
   
      const fichIds : number[] = data.photos.map((mod) => mod['id']);
      
      photos.forEach((photo) => {
        if (!fichIds.includes(photo.id)) {
          //delete picture
          console.log(`remove ${photo.id} , delete file ${photo.filepath}`);
          photo.set({deleted : 1}).save();  
        } else {
          //update picture.photos
          console.log(`update photo.id=${photo.id} with order=${data.photos[fichIds.indexOf(photo.id)].newOrder}`);
          //update the order
          photo.set({order : data.photos[fichIds.indexOf(photo.id)].newOrder}).save();  
        }
      });

      fiches.forEach(async (files) => {
        try {
          if (!files) {
            throw new BadRequestException('invalid file provided');
        }

        const data_ = data.photos.find(item => item.source.indexOf(`/${files.originalname}`)>0);
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
          fileName: data_.fileName,
          filepath: data_.influencerId!=null ? join( `influencer` , `${data_.influencerId}`,files.filename):join( `enseigne` , `${data_.enseigneId}`,files.filename) ,
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


