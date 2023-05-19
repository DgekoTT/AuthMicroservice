//nest generate module roles  создано коммандой

import {forwardRef, Module} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {Role} from "./roles.model";
import {UserRoles} from "./user-role.model";
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";

@Module({
  providers: [RolesService],
  controllers: [RolesController],
  imports:[SequelizeModule.forFeature([Role, User, UserRoles]),
    AuthModule,
    forwardRef(() => UsersModule)
  ],
  exports: [
    RolesService
  ]
})
export class RolesModule {}
