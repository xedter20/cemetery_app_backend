import { Controller, Post, Body, Headers, UseInterceptors, Patch , Param} from '@nestjs/common';
import { LoggingInterceptor } from '../config/logger/core-logging.interceptor';
import { ValidateAccountTypePipe } from '../validation/validate-account-type.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader, ApiParam } from '@nestjs/swagger';


import { HasLoggedInAuthority } from '../decorators/has-logged-in-authority.decorator';
import { RegisterService } from '../service/register.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Unregister } from './dto/unregister.dto';
import { UnregisterResponse } from './dto/unregister-response.dto'; 
import { UserWithPermissionResponseDto } from './dto/user-with-permission-response.dto';

@ApiTags('Register')  // Group the register endpoints under the 'Register' tag in Swagger UI
@Controller('register')
@UseInterceptors(LoggingInterceptor) 
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @HasLoggedInAuthority()
  @Post('/admin')
  @ApiOperation({ summary: 'Register the user e.g., admin, treasurer, guest' })
  @ApiHeader({ name: 'account-type', description: 'Type of account to register (e.g., admin, treasurer, guest)' })
  @ApiBody({ type: CreateUserDto, description: 'The user details for registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid account type or request data' })
  async registerAdmin(@Body() userData: CreateUserDto, @Headers('account-type') accountType: string,  ): Promise<UserWithPermissionResponseDto>{ 
    const validAccountType = new ValidateAccountTypePipe().transform(accountType);
    return this.registerService.register(userData, validAccountType);
  }

  @Post('/client')
  @ApiOperation({ summary: 'Register a client guest user only' })
  @ApiHeader({ name: 'account-type', description: 'Type of account to register (guest only)' })
  @ApiBody({ type: CreateUserDto, description: 'The user details for registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid account type or request data' })
  async registerClient(@Body() userData: CreateUserDto, @Headers('account-type') accountType: string,): Promise<UserWithPermissionResponseDto>{
    const validAccountType = new ValidateAccountTypePipe().transform('guest');
    return this.registerService.register(userData, validAccountType);
  }

  @HasLoggedInAuthority()
  @Patch('/admin/unregister/:email')
  @ApiOperation({ summary: 'Unregister a user by setting status to 99 and adding a reason' })
  @ApiParam({ name: 'email', description: 'Email of the user to unregister' })
  @ApiBody({ type: Unregister, description: 'The reason for unregistering' })
  @ApiResponse({ status: 200, description: 'User unregistered successfully', type: UnregisterResponse })
  @ApiResponse({ status: 417, description: 'User not found' })
  async unregisterUser(@Param('email') email: string, @Body() unregister: Unregister): Promise<UnregisterResponse> {
    return this.registerService.unregister(email, unregister.reason);
  }
}