import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString} from "class-validator";

export class CheckMailDto {
    @ApiProperty({example: 'user@gmail.com', description: 'почта'})
    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    readonly email: string
}