import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString, Matches} from "class-validator";

export class VkLoginDto {

    @ApiProperty({example: '7a6fa4dff77a228eeda56603b8f53806c883f011c40b72630bb50df056f6479e52a', description: 'спец код от вк'})
    @IsString({message: " Должно быть строкой"})
    readonly code: string
}