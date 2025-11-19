import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, Req, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from 'src/common/decorators/auth/currentUser.decorator';
import { updateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { Role } from 'src/db/enums/user.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("profile")
  showProfile(@CurrentUser() user: any) {
    return this.userService.showProfile(user)
  }

  @Post("profile")
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  updateProfile(@CurrentUser() user: any, @Body() data: updateProfileDto , @UploadedFile() avatar: Express.Multer.File) {
    return this.userService.updateProfile(user, data,avatar)
  }

  @Put("me/password")
  changePassword(@CurrentUser() user: any, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(user, data)
  }




}
