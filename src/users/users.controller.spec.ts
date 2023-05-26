import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ClientProxy } from "@nestjs/microservices";
import { Equal } from "typeorm";


describe('UsersController', () => {
  let usersController: UsersController;
  let spyService: UsersService;

  beforeEach(async () => {
    const UsersServiceProvider = {
        provide: UsersService,
     // useFactory: () => ({
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
    it('should call createUser', async () => {
      const userDto = { email: 'user@mail.ru', password: 'password', displayName: 'user'};
      usersController.create(userDto);
      expect(spyService.createUser).toHaveBeenCalled();
    });

    it('should return userId', async () => {
      const userDto = { email: 'user@mail.ru', password: 'password', displayName: 'user'};
      expect(spyService.createUser(userDto)).toBe(2);
    });
  });
  describe('getAllUser', () => {
    it('should call getAllUser', async () => {
        usersController.getAllUsers();
        expect(spyService.getAllUser).toHaveBeenCalled();
      });
    it('should return dto', async () => {
        expect(spyService.getAllUser()).toEqual({name: 'user'});
    });  
  });

});

