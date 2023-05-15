//nest generate controller auth создано командой

import {Body, Controller, Get, Inject, Post, Query, Req, Res, UseGuards, UsePipes} from '@nestjs/common';

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



@Controller('/auth')
export class AuthController {

    constructor(private authService: AuthService,
                private mailService: MailService,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {}

    @Get('verify')
    async verify(@Query('token') token: string) {
        const result = await this.authService.verify(token);
        return { message: `${result || 'Verification successful'}` };
    }

    @Get('google/login')
    @UseGuards(GoogleGuard)
    googleLogin(@Body() body: { accessToken: string },
                @Res({ passthrough: true }) res: Response) {
        return this.makeCookies(res, body.accessToken);
    }

    @Get('google/redirect')
    @UseGuards(GoogleGuard)
    googleRedirect() {
        return { msg: "Google redirect"};
    }

    @Get('vkontakte/login')
    @UseGuards(VKGuard)
    vkLogin() {
        return { msg: "VK Авторизация"};
    }

    @Get('vkontakte/callback')
    @UseGuards(VKGuard)
    vkRedirect() {
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
        const {refreshToken} = request.cookies;
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

    makeCookies(res, token) {
        return  res.cookie('refreshToken', token, {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true})
    }

}
