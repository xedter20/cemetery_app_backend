import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { LoggingInterceptor } from '../config/logger/core-logging.interceptor';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { GuestService } from '../service/guest.service';
import { DeceasedResponse } from '../controller/dto/deceased-response.dto';
import { HasLoggedInAuthority } from '../decorators/has-logged-in-authority.decorator';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './dto/token-response.dto';

@ApiTags('Guest')
@Controller('/guest')
@UseInterceptors(LoggingInterceptor)
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Returns a token response.',
    type: TokenResponse,
  })
  async login(@Body() loginData: LoginDto): Promise<TokenResponse> {
    return this.guestService.login(loginData);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get permissions for the logged-in guest' })
  @ApiResponse({
    status: 200,
    description: 'Returns permissions for the user.',
  })
  @HasLoggedInAuthority()
  async getPermissions() {
    return this.guestService.getPermissions();
  }

  @HasLoggedInAuthority()
  @Get('/search')
  @ApiOperation({ summary: 'Search for a deceased profile by full name' })
  @ApiQuery({ name: 'fullname', description: 'Full name of the deceased' })
  @ApiResponse({
    status: 200,
    description: 'Deceased found successfully.',
    type: DeceasedResponse,
  })
  @ApiResponse({ status: 417, description: 'Decdireased not found.' })
  async searchGuest(
    @Query('fullname') fullname: string,
  ): Promise<DeceasedResponse> {
    const response = await this.guestService.searchByFullname(fullname);
    return response;
  }

  @HasLoggedInAuthority()
  @Get('/searchAll')
  @ApiOperation({ summary: 'Search for a deceased profile by full name' })
  @ApiQuery({ name: 'fullname', description: 'Full name of the deceased' })
  @ApiResponse({
    status: 200,
    description: 'Deceased list found successfullyss.',
    type: DeceasedResponse,
  })
  @ApiResponse({ status: 417, description: 'Decdireased not found.' })
  async searchAllDeceased(
    @Query('fullname') fullname: string,
  ): Promise<DeceasedResponse> {
    const response = await this.guestService.searchAllDeceased(fullname);
    return response;
  }
}
