import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { Types } from "mongoose";
import { Get } from "@nestjs/common";
import { CurrentUser } from "src/common/decorators/auth/currentUser.decorator";
import { Roles } from "src/common/decorators/auth/roles.decorator";
import { Role } from "src/db/enums/user.enum";

// favorites.controller.ts
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly userService: UserService) { }

    @Post(':productId')
    @Roles(Role.user)
    async toggleFavorite(
        @Param('productId') productId: Types.ObjectId,
        @CurrentUser('id') userId: Types.ObjectId,
    ) {
        return this.userService.toggleFavorite(userId, productId);
    }

    @Get()
    @Roles(Role.user)
    async getFavorites(@CurrentUser('id') userId: Types.ObjectId) {
        return this.userService.getFavorites(userId);
    }
}
