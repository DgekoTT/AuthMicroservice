import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/user.model";
import {InjectModel} from "@nestjs/sequelize";
import {Token} from "./token.model";

@Injectable()
export class TokenService {

    constructor(private jwtService: JwtService,
                @InjectModel(Token) private tokenRepository: typeof Token){}

      async generateToken(user: User) {
        const payload = {email: user.email, id: user.id, roles: user.roles}
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload);
        return {
            accessToken,
            refreshToken
        }

    }

     async saveToken(userId: number, refreshToken: string) {

        // @ts-ignore
         const tokenData = await this.tokenRepository.findOne({where: {userId: userId}});
         if(tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save();
        }
         return await this.tokenRepository.create({userId: userId, refreshToken: refreshToken});
    }

    async removeToken(refreshToken) {

        return await this.tokenRepository.destroy({
            where: {
                // @ts-ignore
                refreshToken: `${refreshToken}`
            },
            force: true
        })
    }
}