

import {Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards, UsePipes} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {User} from "./user.model";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/role.guard";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdateProfileDto} from "./dto/update-profile.dto";




@Controller('users')
export class UsersController {

    constructor(private userService: UsersService,
                //подключаем микросервис профиля
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {
    }
    response= {}

    @UsePipes(ValidationPipe)
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }

    // @UseGuards(JwtAuthGuard) //создаем проверку на авторизацию
    @Roles("USER")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Get('/info')
    info() {
        return 'this.userService.getAllUser();'
    }
    @UseGuards(JwtAuthGuard) //создаем проверку на авторизацию
    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Get()
    getAllUsers() {
        return this.userService.getAllUser();
    }

    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Post('/role')
    addRole(@Body() dto: AddRoleDto) {
        return this.userService.addRole(dto);
    }

    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Post('/ban')
    ban(@Body() dto: BanUserDto) {
        return this.userService.ban(dto);
    }

    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Delete('del:id')
    async delUser(@Param('id') id: number): Promise<[string, {}]>{
        const profileDeleted  =   await firstValueFrom( this.client.send({cmd:"delProfile"}, id))
        const userDel = await this.userService.delUser(id);
        const info = makeData(profileDeleted, userDel[0])
        return [userDel[1], info];
    }

    @Roles("admin")
    @UseGuards(RolesGuard) // проверка на роли, получить доступ сможет только админ
    @Get('/:id')
    async getUser(@Param('id') id: number): Promise<{}>{
        const profile = await firstValueFrom(this.client.send({cmd: "getProfile"}, id));
        const user = await this.userService.getUserById(id);
        const info = makeData(profile, user)
        return info;
    }

    @Roles("admin")
    @UseGuards(RolesGuard)
    @Put('/:id')
    async updateProfile(@Body() dto: UpdateProfileDto): Promise<{}>{
        const newProf = await firstValueFrom(this.client.send({cmd:"updateProf"}, dto))
        return newProf;
    }

}

function makeData(profileDeleted: any, userDel: User) {
    return {"id": userDel.id,
        "email": userDel.email,
        "banned": userDel.banned,
        "banReason": userDel.banReason,
        "fullName": profileDeleted.fullName,
        "phone": profileDeleted.phone,
        "age": profileDeleted.age,
        "city": profileDeleted.city,
        "createdAt": userDel.createdAt,
        "updatedAt": userDel.updatedAt
    }
}
