/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PhotoModel } from 'src/photo/photo.model';

@Injectable()
export class PhotoService {
    constructor(
        @InjectModel(PhotoModel)
        private readonly photoRepository: typeof PhotoModel,
    ) {}

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
