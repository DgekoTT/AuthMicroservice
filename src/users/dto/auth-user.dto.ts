
import {IsEmail, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AuthUserDto {
    @ApiProperty({example: 'user@gmail.com', description: 'почта'})
    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    readonly email: string;

    @ApiProperty({example: 'd3F35@34f$', description: 'пароль'})
    @IsString({message: " Должно быть строкой"})
    @Length(8, 16, {message: "Пароль от 8 до 16 симолов"})
    readonly password: string;
}