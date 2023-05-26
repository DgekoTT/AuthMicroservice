import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../auth/role.guard';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                    UsersService,
                    JwtService
                    ]
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true }) // чтобы пропустить проверку на роль
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    describe('create', () => {
        it('should return a new user', async () => {
            const userDto: CreateUserDto =  {email: 'win@mmail.com', password: 'when1234',
                displayName: 'S E G',};
            const user = {id: 1 , ...userDto};

            // @ts-ignore
            jest.spyOn(service, 'createUser').mockImplementation(() => of(user));

            const result = await controller.create(userDto);

            expect(result).toBe(user);
        });

        it('should validate userDto with ValidationPipe', async () => {
            // @ts-ignore
            const userDto: CreateUserDto = {
                email: 'invalid_email',
                password: 'short',
            };

            await expect(controller.create(userDto)).rejects.toThrowError();
        });
    });
});
