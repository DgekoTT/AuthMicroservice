//nest generate controller roles создано командой

import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRoleDto} from "./dto/create-role.dto";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/role.guard";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";



@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {
    }

    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post()
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto)
    }

    @Roles("admin")
    @UseGuards(RolesGuard)
    @Get('/:value')
    getByValue(@Param('value') value: string){
        return this.roleService.getRoleByValue(value)
    }

    @Roles("admin")
    @UseGuards(RolesGuard)
    @Get()
    getAllRoles(){
        return this.roleService. getAllRoles();
    }

}
