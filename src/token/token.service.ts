import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/user.model";
import {InjectModel} from "@nestjs/sequelize";
import {Token} from "./token.model";

@Injectable()
export class TokenService {

    constructor(private jwtService: JwtService,
                @InjectModel(Token) private tokenRepository: typeof Token){}

      async generateToken(user: User): Promise<string>  {
        const payload = {email: user.email, id: user.id, roles: user.roles, displayName: user.displayName}
        console.log(33333333, payload)
          return  this.jwtService.sign(payload);
    }

     async saveToken(userId: number, refreshToken: string): Promise<Token> {

         // @ts-ignore
         const tokenData = await this.tokenRepository.findOne({where: {userId: userId}});
         if(tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save();
        }
         return await this.tokenRepository.create({userId: userId, refreshToken: refreshToken});
    }

    async removeToken(refreshToken: string): Promise<number> {
        return await this.tokenRepository.destroy({
            where: {
                // @ts-ignore
                refreshToken: `${refreshToken}`
            },
            force: true
        })
    }

    async findToken(id: number): Promise<string> {
        const tokenObj = await this.tokenRepository.findOne({
            where: {
                // @ts-ignore
                userId: id
            }})
        return tokenObj.refreshToken;
    }
}