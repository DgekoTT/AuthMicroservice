/*это простой объект который не содержит логики имеет только поля
которые преднозначены для обмена данными между подсистемами
 */

import {IsEmail, IsString, Length} from "class-validator";

export class CreateUserDto {

    @IsString({message: " Должно быть строкой"})
    @IsEmail({},{message: 'Некорректный емайл'})
    readonly email: string;
    @IsString({message: " Должно быть строкой"})
    @Length(8, 16, {message: "Пароль от 8 до 16 симолов"})
    readonly password?: string;
    @IsString({message: " Должно быть строкой"})
    readonly displayName: string;
    @IsString({message: " Должно быть строкой"})
    verificationToken?: string
    @IsString({message: " Должно быть строкой"})
    provider?: string

}