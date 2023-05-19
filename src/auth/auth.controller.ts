//nest generate controller auth создано командой

import {Body, Controller, Get, Inject, Post, Req, Res, UseGuards, UsePipes} from '@nestjs/common';

import {AuthService} from "./auth.service";
import {Response} from "express";
import {Request} from  "express";
import {AuthUserDto} from "../users/dto/auth-user.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {ClientProxy} from "@nestjs/microservices";
import {MailService} from "../mailer/mail.service";
import {GoogleGuard} from "./strategy/google/google.guard";
import {VKGuard} from "./strategy/vk/vk.guard";
import {Roles} from "./roles-auth.decorator";
import {RolesGuard} from "./role.guard";




@Controller('/auth')
export class AuthController {

    constructor(private authService: AuthService,
                private mailService: MailService,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {}


    @Get('google/login')
    @UseGuards(GoogleGuard)
    googleLogin(@Req() req: Request,
                @Res({ passthrough: true }) res: Response) {
    }

    @Get('google/redirect')
    @UseGuards(GoogleGuard)
    googleRedirect(@Req() req: Request,
                   @Res({ passthrough: true }) res: Response) {
        // @ts-ignore
        res.cookie('refreshToken', req.user.dataValues.userToken.refreshToken, {httpOnly: true})
        return
    }

    @Get('vkontakte/login')
    @UseGuards(VKGuard)
    vkLogin() {
        return { msg: "VK Авторизация"};
    }

    @Get('vkontakte/callback')
    @UseGuards(VKGuard)
    vkRedirect(@Req() req: Request,
               @Res({ passthrough: true }) res: Response) {

        res.cookie('refreshToken', req.user[1], {httpOnly: true})
        return { msg: "VK redirect"};
    }

    @UsePipes(ValidationPipe)
    @Post('/login')
    async login(@Body() userDto: AuthUserDto,
          @Res({ passthrough: true }) res: Response) {
        const userInfo =  await this.authService.login(userDto);

        res.cookie('refreshToken', userInfo, {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true})
        return userInfo;
    }

    @Post("/registration")
    async registration(@Body() userDto: CreateUserDto,
                 @Res({ passthrough: true }) res: Response) {
        const userInfo =  await this.authService.registration(userDto);
        res.cookie('refreshToken', userInfo, {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true})
        return userInfo;
    }

    @Post('/logout')
    logout( @Req() request: Request,
        @Res({ passthrough: true }) response: Response) {
        const {refreshToken} = request.cookies;
        console.log(request)
        const token = this.authService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return token;

    }

    @UsePipes(ValidationPipe)
    @Post('/refresh')
    async refresh(@Body() userDto: AuthUserDto,
                  @Req() request: Request,
                  @Res({ passthrough: true }) res: Response) {

        const userInfo =  await this.authService.login(userDto);
        res.cookie('refreshToken', userInfo, {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true})
        return userInfo;
    }

    @Get('status')
    user(@Req() request: Request) {
        console.log(request.user);
        if (request.user) {
            return { msg: 'Authenticated' };
        } else {
            return { msg: 'Not Authenticated' };
        }
    }
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Get('/i')
    getAllRoles(){
        return "HI MAN ";
    }

}
