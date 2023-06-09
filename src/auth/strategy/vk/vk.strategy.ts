import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AuthService} from "../../auth.service";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {VkLoginDto} from "../../dto/login.Vk.dto";





@Injectable()
export class VkLogin  {
    constructor(private authService: AuthService,
                private http: HttpService) {}


    async getToken(key: VkLoginDto): Promise<any> {
        const adminKey = {
            clientID: '51666090',
            clientSecret: 'qYJ3GwZTg2lCBfciUehT',
        };

        const host="http://localhost:3000";

        return await firstValueFrom(
            this.http.get(
                `https://oauth.vk.com/access_token?client_id=${adminKey.clientID}&client_secret=${adminKey.clientSecret}&redirect_uri=${host}&code=${key.code}`,
            ),
        );

    }

    async getUserFromVk(userId: number, token: string): Promise<any> {
        return firstValueFrom(
            this.http.get(
                `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`,
            ),
        );
    }


    async VkLogin(code: VkLoginDto){
        let userInfo;
        try {
            userInfo = await this.getToken(code);
        } catch (err) {
            console.log(err)
            throw new HttpException('ОШибка входа', HttpStatus.BAD_REQUEST);
        }

        if (userInfo.data.email) {
            return await this.authService.validateGoogleOrVk({
                email: userInfo.emails[0],
                displayName: userInfo.displayName,
                provider: 'VK'
            })
        }
        return new HttpException('Укажите почту в ВК', HttpStatus.BAD_REQUEST)
        }

}
