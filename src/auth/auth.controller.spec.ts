import {AuthController} from "./auth.controller";
import {Test, TestingModule} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import { MailService } from "../mailer/mail.service";
import { MailerService } from "@nestjs-modules/mailer";

describe("test controller auth", () => {
    let controller: AuthController;
    let spyService: AuthService;
    const mockAuthService = {

    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                MailService,
                MailerService
            ],
        })
            .overrideProvider(AuthService)
            .useValue(mockAuthService)
            .compile();

        controller = module.get<AuthController>(AuthController);
        spyService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined()
    });
})