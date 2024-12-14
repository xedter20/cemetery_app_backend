import { Injectable, Scope } from '@nestjs/common';
import { PrincipalUser } from '../../controller/dto/principal-user.dto';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class PrincipalUserService {
  private principalUser: PrincipalUser;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  // Set PrincipalUser
  setPrincipalUser(principalUser: PrincipalUser) {
    this.principalUser = principalUser;
  }

  // Get PrincipalUser
  getPrincipalUser(): PrincipalUser {
    return this.principalUser;
  }

  email(): string {
    return this.principalUser?.email;
  }
  
  accountType(): string {
    return this.principalUser?.accountType;
  }
  
  userId(): string {
    return this.principalUser?.userId;
  }
}