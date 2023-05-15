import {PassportSerializer} from "@nestjs/passport";
import {AuthService} from "../../auth.service";
import {Injectable} from "@nestjs/common";
import {User} from "../../../users/user.model";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private authService: AuthService) {
        super();
    }
    serializeUser(user: User, done: Function): any {
        console.log('serializeUser')
        done(null, user)
    }
    async deserializeUser(payload: any, done: Function): Promise<any> {
      const user = await this.authService.findGoogleUser(payload.id);
      return user ? done(null, user) : done(null, null);
    }
}