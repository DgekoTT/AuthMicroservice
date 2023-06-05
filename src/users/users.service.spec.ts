import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './user.model';
import { RolesService } from '../roles/roles.service';
import { MailService } from '../mailer/mail.service';
import { TokenService } from '../token/token.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { BanUserDto } from './dto/ban-user.dto';


describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: typeof User;
  let roleService: RolesService;
  let mailService: MailService;
  let tokenService: TokenService;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        RolesService,
        MailService,
        TokenService,
        {
          provide: getModelToken(User),
          useValue: {},
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: {},
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<typeof User>(getModelToken(User));
    roleService = moduleRef.get<RolesService>(RolesService);
    mailService = moduleRef.get<MailService>(MailService);
    tokenService = moduleRef.get<TokenService>(TokenService);
    client = moduleRef.get<ClientProxy>('AUTH_SERVICE');
  });

  describe('createUser', () => {
    it('должен создать пользователя с паролем', async () => {
      const createUserDto: CreateUserDto = {
        displayName: "Ivan",
        email: 'test@example.com',
        password: 'test123',

      };

      const mockUser = new User();
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);

      const mockRole = {value: 'user'};
      // @ts-ignore
      jest.spyOn(roleService, 'getRoleByValue').mockResolvedValue(mockRole);
      const mockToken = 'mock-token';
      jest.spyOn(tokenService, 'generateToken').mockResolvedValue(mockToken);
      // @ts-ignore
      jest.spyOn(tokenService, 'saveToken').mockResolvedValue(mockToken);

      const result = await usersService.createUser(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        provider: 'mail',
      });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(roleService.getRoleByValue).toHaveBeenCalledWith('user');
      expect(roleService.getRoleByValue).toHaveBeenCalledTimes(1);
      expect(tokenService.generateToken).toHaveBeenCalledTimes(1);
      expect(tokenService.saveToken).toHaveBeenCalledWith(mockUser.id, mockToken);
      expect(tokenService.saveToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockUser, mockToken]);
    });


    describe('getAllUser', () => {
      it('должен вернуть всех пользователей', async () => {
        const mockUsers = [new User(), new User()];
        jest.spyOn(userRepository, 'findAll').mockResolvedValue(mockUsers);

        const result = await usersService.getAllUser();

        expect(userRepository.findAll).toHaveBeenCalledWith({include: {all: true}});
        expect(userRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUsers);
      });
    });

    describe('checkEmail', () => {
      it('должен вернуть email если пользователь не существует', async () => {
        const email = 'test@example.com';
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        const result = await usersService.checkEmail(email);

        expect(userRepository.findOne).toHaveBeenCalledWith({where: {email}});
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(email);
      });

      it('должен вернуть сообщение если пользователь существует', async () => {
        const email = 'test@example.com';
        const mockUser = new User();
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

        const result = await usersService.checkEmail(email);

        expect(userRepository.findOne).toHaveBeenCalledWith({where: {email}});
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(`Пользователь с таким ${mockUser.email} уже существует`);
      });
    });

    describe('getUserByEmail', () => {
      it('должен вернуть пользователя по email', async () => {
        const email = 'test@example.com';
        const mockUser = new User();
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

        const result = await usersService.getUserByEmail(email);

        expect(userRepository.findOne).toHaveBeenCalledWith({where: {email}, include: {all: true}});
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUser);
      });
    });

    describe('getUserByName', () => {
      it('должен вернуть имя если пользователь не существует', async () => {
        const displayName = 'Test User';
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        const result = await usersService.getUserByName(displayName);

        expect(userRepository.findOne).toHaveBeenCalledWith({where: {displayName}});
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(displayName);
      });

      it('должен вернуть сообщение если имя занято ', async () => {
        const displayName = 'Test User';
        const mockUser = new User();
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

        const result = await usersService.getUserByName(displayName);

        expect(userRepository.findOne).toHaveBeenCalledWith({where: {displayName}});
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(`Пользователь с таким ${mockUser.displayName} уже с

уществует`);
      });
    });



      it('должен выдать ошибку если пользователь или роль не существуют', async () => {
        const userId = 1;
        const dto: AddRoleDto = {userId, value: 'admin'};
        jest.spyOn(userRepository, 'findByPk').mockResolvedValue(null);
        jest.spyOn(roleService, 'getRoleByValue').mockResolvedValue(null);

        await expect(usersService.addRole(dto)).rejects.toThrowError('Подьзователь или роль не найдены');
      });
    });

    describe('ban', () => {
      it('должен забанить пользователя', async () => {
        const userId = 1;
        const dto: BanUserDto = {userId, banReason: 'Violation'};
        const mockUser = new User();
        jest.spyOn(userRepository, 'findByPk').mockResolvedValue(mockUser);
        jest.spyOn(mockUser, 'save').mockResolvedValue(mockUser);

        const result = await usersService.ban(dto);

        expect(userRepository.findByPk).toHaveBeenCalledWith(dto.userId);
        expect(userRepository.findByPk).toHaveBeenCalledTimes(1);
        expect(mockUser.banned).toBe(true);
        expect(mockUser.banReason).toBe(dto.banReason);
        expect(mockUser.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUser);
      });

      it('должен выдать ошибку если пользователь ненайден', async () => {
        const userId = 1;
        const dto: BanUserDto = {userId, banReason: 'Violation'};
        jest.spyOn(userRepository, 'findByPk').mockResolvedValue(null);

        await expect(usersService.ban(dto)).rejects.toThrowError('Подьзователь не найдены');
      });
    });

    describe('delUser', () => {
      it('должен удалить пользователя и вернуть его значени и результат в сообщении', async () => {
        const userId = 1;
        const mockUser = new User();
        jest.spyOn(usersService, 'checkUser').mockResolvedValue(mockUser);
        jest.spyOn(usersService, 'delPhase').mockResolvedValue('Success');

        const result = await usersService.delUser(userId);

        expect(usersService.checkUser).toHaveBeenCalledWith(userId);
        expect(usersService.checkUser).toHaveBeenCalledTimes(1);
        expect(usersService.delPhase).toHaveBeenCalledWith(userId);
        expect(usersService.delPhase).toHaveBeenCalledTimes(1);
        expect(result).toEqual([mockUser, 'Success']);
      });
    });

    describe('delPhase', () => {
      it('должен удалить пользователя', async () => {
        const userId = 1;
        jest.spyOn(userRepository, 'destroy').mockResolvedValue(1);

        const result = await usersService.delPhase(userId);

        expect

        (userRepository.destroy).toHaveBeenCalledWith({where: {id: userId}});
        expect(userRepository.destroy).toHaveBeenCalledTimes(1);
        expect(result).toEqual('Пользователь успешно удален');
      });

      it('должен выдать ошибку если пользователь не найден', async () => {
        const userId = 1;
        jest.spyOn(userRepository, 'destroy').mockResolvedValue(0);

        await expect(usersService.delPhase(userId)).rejects.toThrowError('Пользователь не найден');
      });
    });
  })

