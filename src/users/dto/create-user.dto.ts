/*это простой объект который не содержит логики имеет только поля
которые преднозначены для обмена данными между подсистемами
 */

import {IsEmail, IsOptional, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'user@gmail.com', description: 'почта'})
    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    readonly email: string;

    @ApiProperty({example: 'd3F35@34f$', description: 'пароль'})
    @IsString({message: " Должно быть строкой"})
    @Length(8, 16, {message: "Пароль от 8 до 16 симолов"})
    readonly password: string;

    @ApiProperty({example: 'Петя', description: 'имя, ник или имя и фамилия пользователя'})
    @IsString({message: " Должно быть строкой"})
    readonly displayName: string;

    @ApiProperty({example: '2dsfd24fasf', description: 'токен который использовался для подтверждения почты', required: false})
    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    verificationToken?: string

    @ApiProperty({example: 'email', description: 'как был зарегистрирован пользователь', required: false})
    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    provider?: string

    @ApiProperty({example: '2dsfd24fasf', description: 'как быз зарегистрирован пользователь', required: false})
    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    userToken?: string
}