

import {Body, Controller, Delete, Get, Inject, Param, Post, UseGuards, UsePipes} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {User} from "./user.model";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/role.guard";
import {ClientProxy} from "@nestjs/microservices";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiCookieAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";





@Controller('users')
export class UsersController {

    constructor(private userService: UsersService,
                //подключаем микросервис профиля
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {
    }


    @ApiOperation({summary: 'создание пользователя'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: User, isArray: false})
    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() userDto: CreateUserDto): Promise<[User, string]> {
        return this.userService.createUser(userDto);
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'получение всех пользователей из бд'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: User, isArray: true})
    @UseGuards(JwtAuthGuard) //создаем проверку на авторизацию
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Get()
    getAllUsers() : Promise<User[]> {
        return this.userService.getAllUser();
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'создание новой роли'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Roles, isArray: false})
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Post('/role')
    addRole(@Body() dto: AddRoleDto): Promise<AddRoleDto>  {
        return this.userService.addRole(dto);
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'бан пользователя'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: BanUserDto, isArray: false})
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Post('/ban')
    ban(@Body() dto: BanUserDto): Promise<User> {
        return this.userService.ban(dto);
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'удаление пользователя'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: User, isArray: true})
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Delete('del:id')
    async delUser(@Param('id') id: number): Promise<[User, string]> {
        return await this.userService.delUser(id);
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'получение пользователя по id'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: User, isArray: false})
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Get('/:id')
    async getUser(@Param('id') id: number): Promise<User> {
        return await this.userService.getUserById(id);
    }

}
