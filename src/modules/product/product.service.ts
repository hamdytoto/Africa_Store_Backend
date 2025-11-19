import { BadRequestException, ConflictException, ConsoleLogger, Injectable, NotFoundException, Query, Type } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Types } from 'mongoose';
import { ProductRepository } from 'src/db/repos/product.repository';
import { CategoryRepository } from 'src/db/repos/category.repository';
import { v4 as uuid } from 'uuid'
import { FileUploadService } from 'src/common/services/fileupload/fileupload.service';
import { ConfigService } from '@nestjs/config';
import { Image } from 'src/common/types/image.type';
import slugify from 'slugify';
import { FindProductsDto } from './dto/find-product.dto';
import { productDocument } from 'src/db/models/product.model';
import { StockGateway } from '../socket/stock.gateway';

@Injectable()
export class ProductService {
  constructor(private readonly _ProductRepository: ProductRepository,
    private readonly _categoryRepository: CategoryRepository,
    private readonly _fileUpload: FileUploadService,
    private readonly _ConfigService: ConfigService,
    private readonly _StockGateway: StockGateway

  ) { }
  async create(
    data: CreateProductDto,
    userId: Types.ObjectId,
    files: Record<string, Express.Multer.File[]>,
    categoryId: Types.ObjectId) {
    // try {
    const findproduct = await this._ProductRepository.findOne({ filter: { name: data.name } });
    if (findproduct) throw new ConflictException('Product with this name already exists');
    const category = await this._categoryRepository.findOne({ filter: { _id: categoryId } })
    if (!category) throw new NotFoundException('Category not found');
    const cloudFolder = `${this._ConfigService.get<string>('CLOUD_ROOT_FOLDER')!}/products/${data.name.toLowerCase().replace(/\s+/g, '-') + '-' + uuid().split('-')[0]}/thumbnail`;
    const [thumbnail] = await this._fileUpload.saveFileToCloud(files.thumbnail,
      { folder: cloudFolder });

    let images: Image[] | undefined;
    if (files.images) {
      images = await this._fileUpload.saveFileToCloud(files.images,
        { folder: cloudFolder.replace('/thumbnail', '/images') });
    }
    const product = await this._ProductRepository.create({
      ...data,
      thumbnail,
      cloudFolder,
      ...(images && { images }), createdBy: userId, category: categoryId
    });
    return { data: product, message: 'Product created successfully' };
  }

  async update(
    productId: Types.ObjectId,
    updatedData: UpdateProductDto,
    userId: Types.ObjectId,
    files?: Record<string, Express.Multer.File[]>,
  ) {
    const product = await this._ProductRepository.findOne({ filter: { _id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Optional: regenerate slug if name changed
    if (updatedData.name) {
      updatedData.slug = slugify(updatedData.name);
    }

    // Preserve or update category
    if (updatedData.category) {
      const categoryExists = await this._categoryRepository.findOne({
        filter: { _id: updatedData.category }
      });

      if (!categoryExists) throw new NotFoundException("Category not found");
    } else {
      updatedData.category = product.category;
    }


    // Handle thumbnail update
    if (files?.thumbnail?.length) {
      // Delete old thumbnail from cloud if needed
      if (product.thumbnail?.public_id) {
        await this._fileUpload.deleteFiles([product.thumbnail.public_id]);
      }

      // Upload new one
      const [newThumbnail] = await this._fileUpload.saveFileToCloud(files.thumbnail, {
        folder: product.cloudFolder,
      });
      updatedData.thumbnail = newThumbnail;
    }

    // Handle images update
    if (files?.images?.length) {
      // Optional: delete old images or append new ones
      const newImages = await this._fileUpload.saveFileToCloud(files.images, {
        folder: product.cloudFolder.replace('/thumbnail', '/images'),
      });

      // You can choose:
      // 1️⃣ Replace all old images:
      updatedData.images = newImages;

      // 2️⃣ Or append to existing images:
      // updatedData.images = [...(product.images || []), ...newImages];
    }

    const updated = await this._ProductRepository.update({
      filter: { _id: productId },
      update: { ...updatedData, updatedBy: userId },
    });

    return { data: updated, message: 'Product updated successfully' };
  }


  async removeImage(productId: Types.ObjectId, userId: Types.ObjectId, secure_url: string) {
    const product = await this._ProductRepository.findOne({
      filter: {
        _id: productId, createdBy: userId,
        $or: [{ 'thumbnail.secure_url': secure_url }, { 'images.secure_url': secure_url }]
      }
    });
    if (!product) throw new NotFoundException('No product found matching this image');
    const { thumbnail, images } = product;
    // secure_url 
    if (thumbnail.secure_url === secure_url) {
      if (!images?.length) {
        throw new BadRequestException(`can not remove only thumbnail image ,Please upload another image first`);
      }
      await this._fileUpload.deleteFiles([thumbnail.public_id]);
      const lastImage = images[images.length - 1];
      product.thumbnail = lastImage;
      product.images.pop();
    }
    else {
      const imageToRemove = images?.find(image => image.secure_url === secure_url);
      await this._fileUpload.deleteFiles([imageToRemove!.public_id]);
      product.images = images.filter((img) => img.secure_url !== secure_url);
    }

    await product.save();
    return { data: product, message: 'Image removed successfully' };
  }

  async addImage(productId: Types.ObjectId, userId: Types.ObjectId, isThumbnail: boolean, image: Express.Multer.File) {
    if (!image) throw new BadRequestException('Image is required');

    const product = await this._ProductRepository.findOne({
      filter: {
        _id: productId, createdBy: userId,
      }
    });
    if (!product) throw new NotFoundException('Product not found');
    if (isThumbnail) {
      const [thumbnail] = await this._fileUpload.saveFileToCloud(
        [image],
        { public_id: product.thumbnail.public_id }
      )
      product.thumbnail = thumbnail;
    }
    else {
      const results = await this._fileUpload.saveFileToCloud(
        [image],
        { folder: product.cloudFolder }
      )
      product.images.push(results[0]);
    }
    await product.save();
    return { data: product, message: 'Image added successfully' };
  }

  async findAll(query: FindProductsDto) {
    // console.log(query)
    const products = await this._ProductRepository.findAll({
      filter: {
        ...(query.category && { category: new Types.ObjectId(query.category) }),
        ...(query.k && {
          $or: [{ name: { $regex: query.k, $options: 'i' } }]
        }),
        ...(query.price && {
          finalPrice: {
            ...(query.price.min !== undefined && { $gte: query.price.min }),
            ...(query.price.max !== undefined && { $lte: query.price.max }),
          }
        }),
        ...(query.club && { club: query.club })
      },
      sort: {
        ...(query.sort?.by && { [query.sort.by]: query.sort.dir ? query.sort.dir : 1 }),
      },
      paginate: {
        page: query.pagination?.page,
        limit: query.pagination?.limit
      },
      populate: [{ path: 'createdBy', select: '_id name email' },
      { path: 'category', select: '_id name slug' }],
    },

    );
    return { data: products.data, pagination: products.pagination, message: 'Products fetched successfully' };

  }

  async findOne(id: Types.ObjectId) {
    const product = await this._ProductRepository.findOne({ filter: { _id: id }, populate: [{ path: 'createdBy', select: '_id name email' }, { path: 'category', select: '_id name ' }] });
    if (!product) throw new NotFoundException('Product not found');
    return { data: product, message: 'Product fetched successfully' };
  }

  async remove(productId: Types.ObjectId, userId: Types.ObjectId) {
    const product = await this._ProductRepository.findOne({ filter: { _id: productId } });
    if (!product) throw new NotFoundException('Product not found or already deleted');
    await product.deleteOne();
    return { data: product, message: 'Product deleted successfully' };
  }

  async removeAll() {
    const { deletedCount, deletedDocs } = await this._ProductRepository.deleteMany({});
    if (deletedCount === 0) {
      throw new NotFoundException('No products found');
    }
    const rootFolder = this._ConfigService.get<string>('CLOUD_ROOT_FOLDER')!;
    for (const doc of deletedDocs) {
      await this._fileUpload.deleteFolder(`${rootFolder}/products/${doc.cloudFolder}`);
    }
    return { data: {}, message: 'Products deleted successfully' };
  }

  async removeProductsByCategory(categoryId: Types.ObjectId) {
    const categoryObjectId = new Types.ObjectId(categoryId);

    // Perform deletion
    const result = await this._ProductRepository.deleteMany({ category: categoryObjectId });
    // Check how many were deleted
    if (!result.deletedCount || result.deletedCount === 0) {
      return; // No products to delete
    }
    return;
  }

  instock(product: productDocument, quantity: number) {
    return product.stock >= quantity ? true : false
  }

  async checkProductExists(productId: Types.ObjectId) {
    const product = await this._ProductRepository.findOne({ filter: { _id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateStock(productId: Types.ObjectId, quantity: number, increment: boolean) {
    const product = await this._ProductRepository.update({
      filter: { _id: productId },
      update: { $inc: { stock: increment ? quantity : -quantity } }
    });
    //emit socket event 
    this._StockGateway.broadcastStockUpdate(product!._id, product!.stock);
    return product;
  }
}
