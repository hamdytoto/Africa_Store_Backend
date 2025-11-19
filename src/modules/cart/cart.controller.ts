import { userSchema } from './../../db/models/user.model';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Types } from 'mongoose';
import { CurrentUser } from 'src/common/decorators/auth/currentUser.decorator';
import { Roles } from 'src/common/decorators/auth/roles.decorator';
import { Role } from 'src/db/enums/user.enum';
import { ObjectIdValidationPipe } from 'src/common/pipes/objectid-validation.pipe';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Roles(Role.user)
  @Post()
  async addToCart(@Body() data: AddToCartDto, @CurrentUser('_id') userId: Types.ObjectId) {
    return this.cartService.addToCart(data, userId);
  }

  @Patch()
  @Roles(Role.user)
  async updateCart(@Body() data: UpdateCartDto, @CurrentUser('_id') userId: Types.ObjectId) {
    return this.cartService.updateCart(data, userId);
  }

  @Roles(Role.user)
  @Delete('/clear')
  async clearCart(@CurrentUser('_id') id: Types.ObjectId) {
    return this.cartService.clearCart(id);
  }

  @Roles(Role.user)
  @Get()
  async getCart(@CurrentUser('_id') userId: Types.ObjectId) {
    return this.cartService.getCart(userId);
  }
  @Roles(Role.user)
  @Delete('/:productId')
  async removeFromCart(
    @Param('productId', ObjectIdValidationPipe) productId: Types.ObjectId,
    @CurrentUser('_id') userId: Types.ObjectId,
  ) {
    return this.cartService.removeFromCart(productId, userId);
  }
}
