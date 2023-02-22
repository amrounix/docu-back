import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PhotoModel } from './photo/photo.model';
import { PhotoModule } from './photo/photo.module';
import { uploadRootPath } from './utils/path.util';

@Module({
  imports: [
    /* ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }), */
    ServeStaticModule.forRoot({
      rootPath: uploadRootPath,
      exclude: ['/api*'],
    }),
    MulterModule.register({
      dest: uploadRootPath,
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'sqlite',
        //storage: "/sandbox/src/db/database.sqlite",
        storage: 'database.sqlite',
        models: [PhotoModel],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    PhotoModule,
  ],
})
export class AppModule {}
