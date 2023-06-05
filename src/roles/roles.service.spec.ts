import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Role } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';
import {getModelToken} from "@nestjs/sequelize";

describe('RolesService', () => {
    let rolesService: RolesService;
    let roleRepository: any;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                RolesService,
                { provide: getModelToken(Role), useValue: {} },
            ],
        }).compile();

        rolesService = moduleRef.get<RolesService>(RolesService);
        roleRepository = moduleRef.get(getModelToken(Role));
    });

    describe('createRole', () => {
        it('должен создать роль', async () => {
            const createRoleDto: CreateRoleDto = { value: 'admin', description: 'main role, boss' };
            const mockRole = new Role();
            jest.spyOn(roleRepository, 'create').mockResolvedValue(mockRole);

            const result = await rolesService.createRole(createRoleDto);

            expect(roleRepository.create).toHaveBeenCalledWith(createRoleDto);
            expect(roleRepository.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRole);
        });
    });

    describe('getRoleByValue', () => {
        it('должен вернуть роль по названию', async () => {
            const value = 'admin';
            const mockRole = new Role();
            jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);

            const result = await rolesService.getRoleByValue(value);

            expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { value } });
            expect(roleRepository.findOne).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRole);
        });
    });

    describe('getAllRoles', () => {
        it('должен вернуть все роли', async () => {
            const mockRoles = [new Role(), new Role()];
            jest.spyOn(roleRepository, 'findAll').mockResolvedValue(mockRoles);

            const result = await rolesService.getAllRoles();

            expect(roleRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRoles);
        });
    });

    describe('createRoles', () => {
        it('должен создать мульти роли', async () => {
            const mockRoles = [new Role(), new Role()];
            jest.spyOn(roleRepository, 'bulkCreate').mockResolvedValue(mockRoles);

            const result = await rolesService.createRoles();

            expect(roleRepository.bulkCreate).toHaveBeenCalledWith([
                { value: 'admin', description: 'main role, boss' },
                { value: 'user', description: 'only user' },
            ]);
            expect(roleRepository.bulkCreate).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRoles);
        });
    });
});
