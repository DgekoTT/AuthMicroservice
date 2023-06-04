//nest generate controller auth создано командой

import {Body, Controller, Get, HttpStatus, Inject, Param, Post, Req, Res, UseGuards, UsePipes} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Response} from "express";
import {Request} from  "express";
import {AuthUserDto} from "../users/dto/auth-user.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {ClientProxy} from "@nestjs/microservices";
import {MailService} from "../mailer/mail.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import Cookies from "nodemailer/lib/fetch/cookies";
import {UsersService} from "../users/users.service";
import {CheckMailDto} from "./dto/check-mail.dto";
import {CheckNameDto} from "./dto/check-name.dto";
import {UserInfo} from "../interfaces/userInfo.interfaces";
import {GoogleLogin} from "./strategy/google/googleLogin";
import {GoogleLoginDto} from "./dto/login.google.dto";
import {VkLogin} from "./strategy/vk/vk.strategy";
import { serialize } from 'cookie';



@ApiTags("контроллер авторизации")
@Controller('/auth')
export class AuthController {

    constructor(private authService: AuthService,
                private mailService: MailService,
                private userService: UsersService,
                private googleService: GoogleLogin,
                private VkService: VkLogin,
                @Inject("AUTH_SERVICE") private readonly client: ClientProxy) {}

    @ApiOperation({summary: 'регистрация admin'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @UsePipes(ValidationPipe)
    @Post("/admin")
    async admin(@Body() userDto: CreateUserDto,
                       @Res({ passthrough: true }) res: Response): Promise<string> {
        const userInfo =  await this.authService.registrationAdmin(userDto);
        res.cookie('refreshToken', userInfo, {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true})
        return userInfo;
    }

    @ApiOperation({summary: 'получение данных пользователя'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Object, isArray: false})
    @Get("/user/info")
    async getUserInfo(@Req() request: Request): Promise<UserInfo> {
        const refreshToken= (request as any).cookies.refreshToken
        return this.authService.getUserInfo(refreshToken);
    }


    @ApiOperation({summary: 'логин при помощи гугла'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @Post('google/login')
    async googleLogin(@Body() userDto: GoogleLoginDto,
                @Res({ passthrough: true }) res: Response)  {
        console.log(userDto)
        const token = await this.googleService.googleLogin(userDto);
        res.status(HttpStatus.OK).cookie('refreshToken', token[1], { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    }


    @ApiOperation({summary: 'логин при помощи VK'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @Get('vkontakte/:login')
    async vkLogin( @Param() info: string, @Res({ passthrough: true }) res: Response) {

        console.log(info)

        const token = await this.VkService.VkLogin(info);
        const refreshToken = token[1];
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        res.setHeader('Set-Cookie', serialize('refreshToken', refreshToken, {
            maxAge,
            httpOnly: true,
        }));
        res.redirect('http://localhost:3000');
    }



    @ApiOperation({summary: 'логин при помощи email'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @UsePipes(ValidationPipe)
    @Post('/login')
    async login(@Body() userDto: AuthUserDto,
          @Res({ passthrough: true }) res: Response): Promise<void>  {
        const token =  await this.authService.login(userDto);
        res.status(HttpStatus.OK).cookie('refreshToken', token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    }

    @ApiOperation({summary: 'регистрация пользователя'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @UsePipes(ValidationPipe)
    @Post("/registration")
    async registration(@Body() userDto: CreateUserDto,
                 @Res({ passthrough: true }) res: Response): Promise<void> {
        const token =  await this.authService.registration(userDto);
        res.status(HttpStatus.OK).cookie('refreshToken', token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    }

    @ApiOperation({summary: 'выход из аккаунта'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @Post('/logout')
    logout( @Req() request: Request,
        @Res({ passthrough: true }) response: Response): void  {
        const {refreshToken} = request.cookies;
        const token = this.authService.logout(refreshToken);
        response.clearCookie('refreshToken').status(HttpStatus.OK);
    }

    @ApiOperation({summary: 'обновление кукис с токеном'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Cookies, isArray: false})
    @UsePipes(ValidationPipe)
    @Post('/refresh')
    async refresh(@Body() userDto: AuthUserDto,
                  @Req() request: Request,
                  @Res({ passthrough: true }) res: Response) : Promise<void>   {

        const token =  await this.authService.login(userDto);
        res.status(HttpStatus.OK).cookie('refreshToken', token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    }

    @ApiOperation({summary: 'проверка емайл'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: String, isArray: false})
    @UsePipes(ValidationPipe)
    @Post('/email')
    async checkMail(@Body() email: CheckMailDto) : Promise<string> {
        console.log(email)
        return this.userService.checkEmail(email.email)
    }

    @ApiOperation({summary: 'проверка по имени'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: String, isArray: false} )
    @UsePipes(ValidationPipe)
    @Post('/name')
    async checkName(@Body() name: CheckNameDto) : Promise<string> {
        return this.userService.getUserByName(name.displayName)
    }

}
