import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class CheckNameDto {
    @ApiProperty({example: 'Петя', description: 'имя, ник или имя и фамилия пользователя'})
    @IsString({message: " Должно быть строкой"})
    readonly displayName: string
}