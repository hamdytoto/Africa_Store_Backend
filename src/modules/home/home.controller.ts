import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/auth/public.decorator';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('home')
@Public()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image',{storage: memoryStorage()}))
  create(@Body() createHomeDto: CreateHomeDto, @UploadedFile() file: Express.Multer.File) {
    return this.homeService.create(createHomeDto , file);
  }

  @Get()
  findAll() {
    return this.homeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id:  Types.ObjectId) {
    return this.homeService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image',{storage: memoryStorage()}))
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() updateHomeDto: UpdateHomeDto , @UploadedFile() file: Express.Multer.File) {
    return this.homeService.update(id, updateHomeDto,file);
  }

  @Delete(':id')
  remove(@Param('id',ParseObjectIdPipe) id: Types.ObjectId) {
    return this.homeService.delete(id);
  }
}
