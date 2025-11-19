import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile, Query, ParseBoolPipe, ParseArrayPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/common/decorators/auth/roles.decorator';
import { Role } from 'src/db/enums/user.enum';
import { CurrentUser } from 'src/common/decorators/auth/currentUser.decorator';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { ThumbnailRequiredPipe } from './pipes/thumbnail.pipe';
import { ObjectIdValidationPipe } from 'src/common/pipes/objectid-validation.pipe';
import { RemoveImageDto } from './dto/remove-image.dto';
import { Public } from 'src/common/decorators/auth/public.decorator';
import { PaginationDto } from '../category/dto/pagnition.dto';
import { FindProductsDto } from './dto/find-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }
  @Roles(Role.admin)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]))
  @Post(':categoryId')
  async create(
    @Param("categoryId", ObjectIdValidationPipe) categoryId: Types.ObjectId,
    @UploadedFiles(ThumbnailRequiredPipe) files: Record<string, Express.Multer.File[]>,
    @Body() data: CreateProductDto,
    @CurrentUser('_id') userId: Types.ObjectId,
  ) {
    // console.log(categoryId);
    return this.productService.create(data, userId, files, categoryId);
  }

  @Patch(':id')
@Roles(Role.admin)
@UseInterceptors(FileFieldsInterceptor([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]))
async update(
  @Param('id', ObjectIdValidationPipe) productId: Types.ObjectId,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  @Body() updatedData: UpdateProductDto,
  @CurrentUser('_id') userId: Types.ObjectId,
) {
  return this.productService.update(productId, updatedData, userId, files);
}


  @Delete(':id/remove-image')
  @Roles(Role.admin)
  async removeImage(
    @Param('id', ObjectIdValidationPipe) productId: Types.ObjectId,
    @CurrentUser('_id') userId: Types.ObjectId,
    @Body() data: RemoveImageDto
  ) {
    return this.productService.removeImage(productId, userId, data.secure_url);
  }
  @Post(':id/add-image')
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('image'))
  async addImage(
    @Param('id', ObjectIdValidationPipe) productId: Types.ObjectId,
    @CurrentUser('_id') userId: Types.ObjectId,
    @UploadedFile() image: Express.Multer.File,
    @Query('isThumbnail', ParseBoolPipe) isThumbnail: boolean
  ) {
    return this.productService.addImage(productId, userId, isThumbnail, image);
  }

  @Get()
  @Public()
  async findAll(@Query() query: FindProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ObjectIdValidationPipe) id: Types.ObjectId) {
    return this.productService.findOne(id);
  }

  @Roles(Role.admin)
  @Delete(':id')
  async remove(@Param('id', ObjectIdValidationPipe) productId: Types.ObjectId, @CurrentUser('_id') userId: Types.ObjectId) {
    return this.productService.remove(productId, userId);
  }
  @Roles(Role.admin)
  async removeAll() {
    return this.productService.removeAll();
  }
}
