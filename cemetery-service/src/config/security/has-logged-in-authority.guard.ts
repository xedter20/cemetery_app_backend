import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasAuthorityService } from '../../service/has-authority.service';
import { PrincipalUserService } from './principal-user.service';
import { PrincipalUser } from '../../controller/dto/principal-user.dto';

@Injectable()
export class HasLoggedInAuthorityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly hasAuthorityService: HasAuthorityService,
    private readonly principalUserService: PrincipalUserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Inside HasLoggedInAuthority'); 
     // Retrieve the 'loggedIn' metadata
     const isLoggedIn = this.reflector.get<boolean>('loggedIn', context.getHandler());
     console.log('isLoggedIn metadata:', isLoggedIn);
 
     if (!isLoggedIn) {
       console.log('No loggedIn metadata found, denying access');
       return false;
     }

    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token not found');
    }

    const token = authorizationHeader.split(' ')[1];

    try {
      // Validate and decode the token
      const decodedToken = this.hasAuthorityService.validateToken(token);

      console.log('decodedToken ',decodedToken); 

      const principalUser = new PrincipalUser().mapFromToken(decodedToken);

      this.principalUserService.setPrincipalUser(principalUser);
      
      return true;
    } catch (error) {
      console.log('Error validating token:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}