import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { HomeRepository } from "../../db/repos/home.repository";
import { CreateHomeDto } from "./dto/create-home.dto";
import { UpdateHomeDto } from "./dto/update-home.dto";
import { FileUploadService } from "src/common/services/fileupload/fileupload.service";
import { v4 as uuid } from 'uuid';
import { Types } from 'mongoose';

@Injectable()
export class HomeService {
  constructor(
    private readonly homeRepository: HomeRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly ConfigService: ConfigService,

  ) { }

  async create(data: CreateHomeDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("home image is required");
    }
    const rootFolder = this.ConfigService.get<string>('CLOUD_ROOT_FOLDER')!;
    const cloudFolder = data.title.toLowerCase().replace(/\s+/g, '-') + '-' + uuid().split('-')[0];
    const results = await this.fileUploadService.saveFileToCloud(
      [file],
      { folder: `${rootFolder}/home/${cloudFolder}`, }
    );

    if (!results.length) {
      throw new InternalServerErrorException("Failed to upload poster image");
    }
    const homePoster = await this.homeRepository.create({
      ...data,
      image: results[0],
    });

    return { data: homePoster, message: " poster created successfully" };
  }


  async findAll() {
    return this.homeRepository.findAll({ });
  }

  async findOne(id: Types.ObjectId) {
    const home = await this.homeRepository.findOne({ filter: { _id: id } });
    if (!home) throw new NotFoundException('Poster not found');
    return { data: home, message: 'Poster fetched successfully' };
  }

  async update(id: Types.ObjectId, data: UpdateHomeDto, file: Express.Multer.File) {
    const home = await this.homeRepository.findOne({ filter: { _id: id } });
    if (!home) {
      throw new NotFoundException('Poster not found');
    }
    if (file) {
      const public_id = home.image?.public_id;
      const results = await this.fileUploadService.saveFileToCloud(
        [file],
        { public_id }
      );
      home.image = results[0];
    }
    Object.assign(home, data);
    await home.save();
    return {
      data: home,
      message: 'Poster updated successfully',
      success: true
    };

  }

  async delete(id: Types.ObjectId) {
    const home = await this.homeRepository.findOne({ filter: { _id: id } });
    if (!home) throw new NotFoundException('Poster not found');
    await home.deleteOne();
    return { data: {}, message: 'Poster deleted successfully' };
  }
}
