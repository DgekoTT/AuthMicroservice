//nest generate controller roles создано командой

import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRoleDto} from "./dto/create-role.dto";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/role.guard";
import {ApiCookieAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Role} from "./roles.model";



@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'создать роль'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Role, isArray: false})
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post()
    create(@Body() dto: CreateRoleDto): Promise<Role> {
        return this.roleService.createRole(dto)
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'получить id роли по названию'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Role, isArray: false})
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Get('/:value')
    getByValue(@Param('value') value: string): Promise<Role> {
        return this.roleService.getRoleByValue(value)
    }

    @ApiCookieAuth()
    @ApiOperation({summary: 'получить все роли'})
    @ApiResponse({status: 200, description: 'Успешный запрос', type: Role, isArray: true})
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Get()
    getAllRoles(): Promise<Role[]>{
        return this.roleService. getAllRoles();
    }

}
