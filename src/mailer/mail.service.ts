import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) {}

    sendMailVerification(email: string, token: string): void {
        const link = `${process.env.APP_BASE_URL}/auth/verify?token=${token}`;
        const message = `Please click on this link to verify your account: ${link}`;
        this.mailService.sendMail({
            to: `${email}`,
            from: 'f1lm.new@yandex.ru',
            subject: "Activation link",
            html: `${message}`
        });
    }

    sendMailPass(email: string, password: string): void{
        this.mailService.sendMail({
            to: `${email}`,
            from: 'f1lm.new@yandex.ru',
            subject: "Activation link",
            html: `Ваш пароль ${password}`
        });
    }
}
