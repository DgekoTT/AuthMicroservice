/*это простой объект который не содержит логики имеет только поля
которые преднозначены для обмена данными между подсистемами
 */

import {IsEmail, IsOptional, IsString, Length} from "class-validator";

export class CreateUserVkGoogleDto {

    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    readonly email: string;

    @IsString({message: " Должно быть строкой"})
    @Length(8, 16, {message: "Пароль от 8 до 16 симолов"})
    @IsOptional()
    readonly password?: string;

    @IsString({message: " Должно быть строкой"})
    readonly displayName: string;

    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    verificationToken?: string

    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    provider?: string

    @IsString({message: " Должно быть строкой"})
    @IsOptional()
    userToken?: string
}