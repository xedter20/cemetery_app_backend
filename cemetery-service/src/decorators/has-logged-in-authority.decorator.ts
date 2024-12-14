import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { HasLoggedInAuthorityGuard } from '../config/security/has-logged-in-authority.guard';


export function HasLoggedInAuthority() {
  return applyDecorators(
    SetMetadata('loggedIn', true),  
    UseGuards(HasLoggedInAuthorityGuard) 
  );
}