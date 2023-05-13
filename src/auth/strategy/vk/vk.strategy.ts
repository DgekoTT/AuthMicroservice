import {Strategy, VerifyCallback} from "passport-vkontakte";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
@Injectable()
export class VkStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: '51641490',
            clientSecret: 'GKbNTcvNwoMb6ZsIssAT',
            callbackURL: 'http://localhost:5010/auth/vkontakte/callback',
            scope: ['profile', 'email'],
            }
        )};

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        console.log(profile)
        return done(null, {
            profile: {
                name: profile.displayName,
                email: profile.email,
            }
        });
    }
}
