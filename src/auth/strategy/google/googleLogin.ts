import {Injectable} from "@nestjs/common";
import {UsersService} from "../../../users/users.service";
import {AuthService} from "../../auth.service";
import {GoogleLoginDto} from "../../dto/login.google.dto";


@Injectable()
export class GoogleLogin {
    constructor(
        private authService: AuthService,
    ) {}

    async googleLogin(UserData: GoogleLoginDto) {
        return await this.authService.validateGoogleOrVk({
            email: UserData.email,
            displayName: UserData.displayName,
            provider: 'Google'
        })
    }
}