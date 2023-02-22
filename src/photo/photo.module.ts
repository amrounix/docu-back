import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PhotoModel } from './photo.model';

@Module({
  imports: [SequelizeModule.forFeature([PhotoModel])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
