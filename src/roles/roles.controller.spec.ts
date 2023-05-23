import {RolesController} from "./roles.controller";
import {RolesService} from "./roles.service";
import {Test, TestingModule} from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";


//const moduleMocker = new ModuleMocker(global)

describe('check RolesController', () =>{
    let controller: RolesController;
    const mockRolesService = {
        getRoleByValue: jest.fn((value) => {
            return {
                value: value
            }
        }),

        createRole: jest.fn((dto) => {
            return {
                ...dto
            }
        })
    };
    const mockGuard = {};

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RolesController],
            providers: [ 
                RolesService,
                JwtService
            ]
            
            })
            .overrideProvider(RolesService)
            .useValue(mockRolesService)
            .compile();

        controller = module.get<RolesController>(RolesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should be show role', () => {

        expect(controller.getByValue('admin')).toEqual({
            value: "admin"
        });

        expect(mockRolesService.getRoleByValue).toHaveBeenCalledWith('admin');
    });

    it('should be create role', () => {
        const dto = {
            value: "user",
            description: "user without rules"
        };
        expect(controller.create(dto)).toEqual({
            value: "user",
            description: "user without rules"
        });

        expect(mockRolesService.createRole).toHaveBeenCalledWith(dto);
    });
    }
)
