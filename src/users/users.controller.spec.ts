import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";



describe('UsersController', () => {
    let usersController: UsersController;
    let spyService: UsersService;

    beforeEach(async () => {
        const UsersServiceProvider = {
            provide: UsersService,
            createUser: jest.fn(() => 2),//(() => 2),
            getAllUser: jest.fn(() => {
                return {
                    name: 'user'
                }
            })

        };

        const app: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                UsersService,
                JwtService],
        })
            .overrideProvider(UsersService)
            .useValue(UsersServiceProvider)
            .compile();

        usersController = app.get<UsersController>(UsersController);
        spyService = app.get<UsersService>(UsersService);
    });

    describe('createUser', () => {
        it('должен вызвать createUser', async () => {
            const userDto = { email: 'user@mail.ru', password: 'password', displayName: 'user'};
            await usersController.create(userDto);
            expect(spyService.createUser).toHaveBeenCalled();
        });

        it('должен вернуть userId', async () => {
            const userDto = { email: 'user@mail.ru', password: 'password', displayName: 'user'};
            expect(spyService.createUser(userDto)).toBe(2);
        });
    });
    describe('getAllUser', () => {
        it('должен вызвать getAllUser', async () => {
            await usersController.getAllUsers();
            expect(spyService.getAllUser).toHaveBeenCalled();
        });
        it('должен вернуть dto', async () => {
            expect(spyService.getAllUser()).toEqual({name: 'user'});
        });
    });

});