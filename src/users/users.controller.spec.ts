import { Test, TestingModule } from '@nestjs/testing';
import {UsersController} from "./users.controller";
import {RolesGuard} from "../auth/role.guard";
import {UsersService} from "./users.service";
import {User} from "./user.model";
import {SequelizeModule} from "@nestjs/sequelize";

describe('MyController', () => {
    let controller: UsersController;
    let guard: RolesGuard;
    let service: UsersService;
    let obj = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [UsersService,],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        guard = module.get<RolesGuard>(RolesGuard);
        service = module.get<UsersService>(UsersService);
    });

    describe('getAll', () => {
        it('should return success response when guard passes', async () => {
            jest.spyOn(guard, 'canActivate').mockReturnValue(true);
            // @ts-ignore
            jest.spyOn(service, 'getAllUser').mockResolvedValue(User[obj] || Promise );

            const response = await controller.getAllUser();

            expect(response).toEqual({ message: 'success' });
        });

        it('should return error response when guard fails', async () => {
            jest.spyOn(guard, 'canActivate').mockReturnValue(false);

            const response = await controller.getAll();

            expect(response).toEqual({ message: 'Unauthorized' });
        });
    });
});