import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDocument } from 'src/db/models/user.model';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { OrderRepository } from 'src/db/repos/order.repository';
import { OrderStatus, PaymentMethod } from 'src/db/models/order.model';
import { PaymentService } from 'src/common/services/payment/payment.service';
import { Types } from 'mongoose';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly _cartService: CartService,
    private readonly _productService: ProductService,
    private readonly _orderRepository: OrderRepository,
    private readonly _paymentService: PaymentService,
    private readonly _couponService: CouponService
  ) {
  }
  async create(data: CreateOrderDto, user: UserDocument) {
    const userId = user._id;
    const cart = await this._cartService.getCart(userId);
    if (!cart || !cart.data.products.length) {
      throw new NotFoundException('empty cart ');
    }
    // check products
    let totalPrice = 0;
    let products: any = [];
    for (const product of cart.data.products) {
      const prod = await this._productService.checkProductExists(product.productId);
      if (!this._productService.instock(prod, product.quantity)) {
        throw new BadRequestException(`Product ${prod.name} is not in stock `);
      }
      totalPrice += prod.finalPrice * product.quantity;
      products.push({
        productId: prod._id,
        name: prod.name,
        price: prod.finalPrice,
        quantity: product.quantity,
        discount: prod.discount,
        subtotal: product.subtotal,
        image: prod.thumbnail.secure_url
      });
    }

    // 🧾 Apply coupon if provided
    let discount = 0;
    let finalTotal = totalPrice;
    let appliedCoupon: any;

    if (data.couponCode) {
      const couponResult = await this._couponService.applyCoupon({
        code: data.couponCode,
        total: totalPrice
      });
      discount = couponResult.data.discount;
      finalTotal = couponResult.data.finalTotal;
      appliedCoupon = couponResult.data;
    }

    // create order
    const order = await this._orderRepository.create({
      ...data,
      cart: cart.data._id,
      user: userId,
      products,
      price: totalPrice,
      coupon: appliedCoupon ? appliedCoupon.code : null,
    })
    if (order.paymentMethod == PaymentMethod.cash) {
      const products = cart.data.products;
      for (const item of products) {
        await this._productService.updateStock(item.productId, item.quantity, false);
      }
      await this._cartService.clearCart(userId);
      return { data: order, message: 'Order created successfully and paid cash' };
    }

    const session = await this.payWithCard(order.id, products, user.email, appliedCoupon)
    return { data: { session: session.url, order }, message: 'Order created successfully' };
  }

  async payWithCard(orderId, products, userEmail: string, appliedCoupon?: any) {
    const line_items = products.map((product) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: product.name,
          images: [product.image]
        },

        unit_amount: product.price * 100
      },
      quantity: product.quantity
    }))
    const { id } = await this._paymentService.createCoupon({
      currency: "egp",
      percent_off: appliedCoupon.value
    })
    return await this._paymentService.createCheckoutSession({
      metadata: { orderId },
      customer_email: userEmail,
      line_items,
      discounts: [{ coupon: id }]
    })
  }

  async findAll(user: UserDocument, query: any) {
    const filter: any = user.role === 'admin' ? {} : { user: user._id };

    const orders = await this._orderRepository.findAll({
      filter: { ...filter, ...query },
      populate: [{
        path: 'user',
        select: 'name email phone avatar'
      }],
      sort: { createdAt: -1 },
    });

    return { data: orders, message: 'Orders fetched successfully' };
  }

  async findOne(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this._orderRepository.findOne({
      filter: { _id: orderId },
      populate: [{
        path: 'user',
        select: 'name email phone avatar'
      }],
    });
    if (!order) throw new NotFoundException('Order not found');
    return { data: order, message: 'Order fetched successfully' };

  }

  async update(orderId: Types.ObjectId, updateOrderDto: UpdateOrderDto) {
    const order = await this._orderRepository.findOneAndUpdate({
      filter: { _id: orderId },
      update: updateOrderDto,
      populate: [{
        path: 'user',
        select: 'name email phone avatar'
      }]
    })
    if (!order) throw new NotFoundException('Order not found');
    return { data: order, message: 'Order updated successfully' };
  }

  async remove(orderId: Types.ObjectId) {
    const order = await this._orderRepository.findOneAndDelete({
      filter: { _id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { data: [], message: 'Order deleted successfully' };
  }

  async changeStatus(orderId: Types.ObjectId, status: OrderStatus) {
    const order = await this._orderRepository.findOneAndUpdate({
      filter: { _id: orderId },
      update: { orderStatus: status },
      populate: [{
        path: 'user',
        select: 'name email phone avatar'
      }]
    })
    if (!order) throw new NotFoundException('Order not found');
    return { data: order, message: 'Order updated successfully' };
  }
  async stripeWebhook(rawBody: Buffer, signature: string) {
    // 1️⃣ Construct Stripe event
    const event = await this._paymentService.createEvents(rawBody, signature);

    let eventObject: any;

    switch (event.type) {
      case 'checkout.session.completed':
        eventObject = event.data.object;
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return;
    }

    if (eventObject) {
      const orderId = eventObject.metadata?.orderId; // Get metadata from Stripe event

      if (!orderId) return;

      // 2️⃣ Update order as paid
      const order = await this._orderRepository.update({
        filter: {
          _id: Types.ObjectId.createFromHexString(orderId),
          paid: false,
          paymentMethod: PaymentMethod.card,
        },
        update: {
          paid: true,
          payment_intent: eventObject.payment_intent,
          orderStatus: OrderStatus.completed,
        },
      });

      // 3️⃣ Clear user cart
      if (order) {
        const cart = await this._cartService.getCart(order.user);
        const products = order.products;
        for (const item of products) {
          await this._productService.updateStock(item.productId, item.quantity, false);
        }
        await this._cartService.clearCart(order.user);
      }
    }
  }

}
