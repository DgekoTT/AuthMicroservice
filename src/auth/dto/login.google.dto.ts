import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString, Matches} from "class-validator";

export class GoogleLoginDto {
    @ApiProperty({example: 'user@gmail.com', description: 'почта'})
    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    @Matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z]+\.[a-zA-Z]+$/, { message: 'Некорректный емайл' })
    readonly email: string

    @ApiProperty({example: 'Иван Иваныч', description: 'Имя пользователя или ФИО'})
    @IsString({message: " Должно быть строкой"})
    readonly displayName: string
}