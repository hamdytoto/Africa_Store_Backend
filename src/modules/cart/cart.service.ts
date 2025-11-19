import { ObjectId, Types } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException, Type } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartRepository } from 'src/db/repos/cart.repository';
import { ProductRepository } from 'src/db/repos/product.repository';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    private readonly _cartRepository: CartRepository,
    private readonly _productRepository: ProductRepository,
    private readonly _productService: ProductService
  ) { }
  async addToCart(data: AddToCartDto, userId: Types.ObjectId) {
    const { productId, quantity } = data;
    const product = await this._productService.checkProductExists(productId);
    const instock = this._productService.instock(product, quantity);
    if (!instock) throw new BadRequestException('Product not in stock');

    const existingCart = await this._cartRepository.findOne({
      filter: { user: userId },
    });

    if (existingCart) {
      // Find product by productId + productSize
      const productIndex = existingCart.products.findIndex(
        (p) =>
          p.productId.toString() === productId.toString() &&
          p.productSize === data.productSize
      );

      if (productIndex !== -1) {
        // Same product & same size → increase quantity
        const newQuantity =
          existingCart.products[productIndex].quantity + quantity;

        if (!this._productService.instock(product, newQuantity)) {
          throw new BadRequestException('Product not in stock');
        }

        existingCart.products[productIndex].quantity = newQuantity;
      } else {
        // Same product but DIFFERENT size → add a new one
        existingCart.products.push({
          productId,
          quantity,
          price: product.finalPrice,
          productSize: data.productSize,
        });
      }

      await existingCart.save();

      return {
        data: existingCart,
        message: 'Product added to cart successfully',
      };
    }

    // No cart → create new one
    const newCart = await this._cartRepository.create({
      user: userId,
      products: [
        {
          productId,
          quantity,
          price: product.finalPrice,
          productSize: data.productSize,
        },
      ],
    });

    return {
      data: newCart,
      message: 'Product added to cart successfully',
    };
  }

  async updateCart(data: UpdateCartDto, userId: Types.ObjectId) {
    const { productId, quantity, _id } = data;
    const product = await this._productRepository.findOne({ filter: { _id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const instock = this._productService.instock(product, quantity!);
    if (!instock) throw new BadRequestException('Product not in stock');

    const cart = await this._cartRepository.update({
      filter: { user: userId, "products._id": _id },
      update: { "products.$.quantity": quantity, "products.$.price": product.finalPrice }
    });

    return {
      data: cart,
      message: 'Cart updated successfully',
    };


  }

  async clearCart(id: Types.ObjectId) {
    const cart = await this._cartRepository.update({ filter: { user: id }, update: { products: [] } });
    return {
      data: cart,
      message: 'Cart cleared successfully',
    }
  }
  async getCart(userId: Types.ObjectId) {
    const cart = await this._cartRepository.findOne({
      filter: { user: userId },
      populate: [
        {
          path: 'products.productId',
          select: ' name thumbnail price stock'
        },
        {
          path: 'user',
          select: ' name email'
        }
      ]
    });

    if (!cart) {
      return {
        data: { products: [], total: 0 },
        message: 'Cart is empty',
      };
    }
    // Transform cart structure
    const transformedProducts = cart.products.map((item: any) => {
      const product = item.productId;
      return {
        _id: item._id,
        productId: product?._id,
        name: product?.name,
        thumbnail: product?.thumbnail?.secure_url,
        quantity: item.quantity,
        price: item.price,
        productSize: item.productSize,
        subtotal: item.price * item.quantity
      };
    });

    const total = transformedProducts.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      data: {
        _id: cart._id,
        user: cart.user,
        products: transformedProducts,
        total,
        itemsCount: transformedProducts.length,
      },
      message: 'Cart fetched successfully',
    };
  }

  async removeFromCart(productId: Types.ObjectId, userId: Types.ObjectId) {
    const cart = await this._cartRepository.findOne({ filter: { user: userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    const productIndex = cart.products.findIndex((p) => p._id?.toString() === productId.toString());
    if (productIndex === -1) throw new NotFoundException('Product not found in cart');
    cart.products.splice(productIndex, 1);
    await cart.save();
    return {
      data: cart,
      message: 'Product removed from cart successfully',
    };
  }

}
