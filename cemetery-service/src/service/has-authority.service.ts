import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { PrincipalUser } from '../controller/dto/principal-user.dto';

@Injectable()
export class HasAuthorityService {
  private publicKey: string;

  constructor() {
    // Load the RSA public key from the environment variable
    const publicKeyPath = process.env.PUBLIC_KEY_PATH;

    if (!publicKeyPath) {
      throw new Error('Public key path is not defined in environment variables');
    }
    // Load the RSA public key
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  validateToken(token: string): any {
    console.log('Inside validateToken'); 
    try {
      // Verify the token using the public RSA key
      return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Create an instance of PrincipalUser and populate it with the token data
  getPrincipalUserFromToken(decodedToken: any): PrincipalUser {
    console.log('Inside getPrincipalUserFromToken'); 
    const principalUser = new PrincipalUser();
    return principalUser.mapFromToken(decodedToken);
  }
}