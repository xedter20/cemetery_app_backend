import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { PrincipalUser } from '../model/principal-user.dto';
import { TokenResponse } from '../model/token-response.dto';
import { LoggingInterceptor } from '../config/logger/core-logging.interceptor';

@Controller('auth')
@UseInterceptors(LoggingInterceptor) 
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate')
  async generateToken(@Body() principalUser: PrincipalUser): Promise<TokenResponse> {
    // Call the generate method in AuthService to generate and return the token
    return this.authService.generate(principalUser);
  }
}