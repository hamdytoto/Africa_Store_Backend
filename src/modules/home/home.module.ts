import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { HomeRepository } from 'src/db/repos/home.repository';
import { HomeModel } from 'src/db/models/home.model';
import { CloudinaryProvider } from 'src/common/services/fileupload/cloudinary.provider';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from 'src/common/services/fileupload/fileupload.service';

@Module({
  controllers: [HomeController],
  imports: [HomeModel],
  providers: [HomeService, HomeRepository, FileUploadService, ConfigService, CloudinaryProvider],
})
export class HomeModule { }
