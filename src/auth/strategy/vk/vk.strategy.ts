import {Params, Profile, Strategy, VerifyCallback} from "passport-vkontakte";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {AuthService} from "../../auth.service";
@Injectable()
export class VkStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            clientID: '51641490',
            clientSecret: 'GKbNTcvNwoMb6ZsIssAT',
            callbackURL: 'http://localhost:5010/auth/vkontakte/callback',
            scope: ['profile', 'email'],
            }, async function validate (
                accessToken: string,
                refreshToken: string,
                params: Params,
                profile: Profile,
                done: VerifyCallback
            ) {
            const  user = await authService.validateGoogleOrVk({
                email: profile.emails[0].value,
                displayName: profile.displayName,
                userToken: accessToken,
                provider: 'VK'
            })
            return done(null, user);
        });
    }
}

