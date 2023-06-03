import {Injectable} from "@nestjs/common";
import {UsersService} from "../../../users/users.service";
import {AuthService} from "../../auth.service";


@Injectable()
export class GoogleLogin {
    constructor(
        private authService: AuthService,
    ) {}

    async googleLogin(UserData) {
        return await this.authService.validateGoogleOrVk({
            email: UserData.email,
            displayName: UserData.displayName,
            provider: 'Google'
        })
    }
}