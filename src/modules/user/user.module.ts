import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from 'src/db/repos/user.repository';
import { UserModel } from 'src/db/models/user.model';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from 'src/db/repos/token.repository';
import { tokenModel } from 'src/db/models/token.model';
import { FavoritesController } from '../product/favorites.controller';
import { ProductRepository } from 'src/db/repos/product.repository';
import { productModel } from 'src/db/models/product.model';
import { CloudinaryProvider } from 'src/common/services/fileupload/cloudinary.provider';
import { FileUploadService } from 'src/common/services/fileupload/fileupload.service';

@Module({
  imports: [UserModel, tokenModel, productModel],
  controllers: [UserController, FavoritesController],
  providers: [UserService, UserRepository, JwtService, TokenRepository, ProductRepository, CloudinaryProvider, FileUploadService],
  exports: [UserService, UserRepository]
})
export class UserModule { } 
