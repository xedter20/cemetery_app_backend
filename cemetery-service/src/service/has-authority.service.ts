import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { PrincipalUser } from '../controller/dto/principal-user.dto';

@Injectable()
export class HasAuthorityService {
  private publicKey: string;
  private readonly logger = new Logger(HasAuthorityService.name);
  constructor() {
    // Load the RSA public key from the environment variable
    const publicKeyPath = './../keys/public.pem'; // Default path if not set
    try {
      this.publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
      this.logger.log('Public key loaded successfully.');
    } catch (error) {
      this.logger.error('Error loading private key:', error);
    }
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
