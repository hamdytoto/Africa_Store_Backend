import { SocketModule } from './../socket/socket.module';
import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/db/repos/product.repository';
import { productModel } from 'src/db/models/product.model';
import { CategoryModule } from '../category/category.module';
import { ConfigService } from '@nestjs/config';
import { FileUploadModule } from 'src/common/services/fileupload/fileupload.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ConfigService ],
  imports: [productModel, forwardRef(() => CategoryModule), FileUploadModule, SocketModule],
  exports: [productModel, ProductRepository, ProductService]
})
export class ProductModule { }
