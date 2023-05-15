import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "./roles-auth.decorator";

// для проверки авторизации пользователя и запрете доступа при ее отсутвии
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private jwtService: JwtService,
                //рефлектор помогает доставать данные
                private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ])
            if (!requiredRoles) {
                return true;
            }
            const req = context.switchToHttp().getRequest()
            const autHeader = req.headers.authorization;
            const bearer = autHeader.split(' ')[0];
            const token = autHeader.split(' ')[1];
            console.log('1')

            if(bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException({message: "Пользователь не авторизован"})
            }

            const user = this.jwtService.verify(token, { ignoreExpiration: false });
            console.log(user)
            req.user = user;
            return user.roles.some(role => requiredRoles.includes(role.value));
        } catch (e) {
            console.log(e)
            throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN)
        }
    }
}