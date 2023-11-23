/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { PhotoModel } from 'src/photo/photo.model';
import { uploadRootPath } from 'src/utils/path.util';


@Injectable()
export class PhotoService {


    constructor(
        @InjectModel(PhotoModel)
        private readonly photoRepository: typeof PhotoModel,
        private readonly httpService: HttpService,
        ) {}


    async importProfilPicture(imgUrl: string, token: string) {

        await mkdir(join(uploadRootPath, `profils` , `instagram`), {recursive: true});

        const response = await this.httpService.axiosRef({
          url: imgUrl,
          method: "GET",
          responseType: "stream",
        });
    
        const stream = response.data;
        //const streamFile = await fileTypeFromStream( stream );
    
        //console.log(streamFile.ext);
        const ext = 'jpg';
    
        const filename = token+'.'+ext;
    
        const writer = createWriteStream(join(uploadRootPath, `profils` , `instagram`, filename));
    
    
        return await new Promise((resolve, reject) => {
            stream.pipe(writer);
            writer.on("finish", () => resolve({'filename': filename, 'token' : token}));
            writer.on("error", reject);
        });
    }

    findAll(): Promise<PhotoModel[]> {
        return this.photoRepository.findAll({where : {deleted : 0}, order : ['order']});
    }

    findByEnseigne(enseigneId: number): Promise<PhotoModel[]> {
        return this.photoRepository.findAll({ where: { enseigneId : enseigneId,deleted : 0}});
    }

    findByInfluencer(influencerId: number): Promise<PhotoModel[]> {
        return this.photoRepository.findAll({ where: { influencerId : influencerId,deleted : 0}});
    }

    create(model: any) : Promise<PhotoModel> {
        return this.photoRepository.create(model);  
    }


}
