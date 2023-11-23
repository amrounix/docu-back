import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PhotoModel } from './photo.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SequelizeModule.forFeature([PhotoModel]), HttpModule],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
