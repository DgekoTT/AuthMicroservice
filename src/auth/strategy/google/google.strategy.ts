
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import {Injectable} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {Profile} from "passport-vkontakte";
import {AuthService} from "../../auth.service";

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService
    ) {
        super({
            clientID: '495704197094-mv78p6077iml80ieo73t9a2o5tgj122l.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:5010/auth/google/redirect',
            scope: ['profile', 'email'],
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
        const  token = await this.authService.validateGoogleOrVk({
            email: profile.emails[0].value,
            displayName: profile.displayName,
            provider: 'Google'
        })
        return {accessToken: token};
    }
}