import * as jwt from 'jsonwebtoken';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from '../model/auth-session.entity';
import { PrincipalUser } from '../model/principal-user.dto';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path'; // Ensure path is correctly imported
// Load environment variables from the .env file
dotenv.config();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); 
  
   // Dynamically load RSA private key from the environment variable path
   private privateKey: string;

   constructor(
    @InjectRepository(AuthSession)
    private authSessionRepository: Repository<AuthSession>,
  ) {
    const privateKeyPath =  '../../keys/private.pem'; // Default path if not set
    try {
      this.privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
      this.logger.log('Private key loaded successfully.');
    } catch (error) {
      this.logger.error('Error loading private key:', error);
    }
  }


   // Load RSA private key from environment variable path




  // Load RSA public key from environment variable path
  // private publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

  async generate(principalUser: PrincipalUser) {
    console.log({dex:this.privateKey,ter:process.env.PRIVATE_KEY_PATH});
    console.log('Received request to /auth/generate', principalUser); 
    try {
      // Create bearer token with RSA private key
      const token = jwt.sign(
        {
          id: principalUser.id,
          firstname: principalUser.firstname,
          lastname: principalUser.lastname,
          email: principalUser.email,
          userId: principalUser.userId,
          role: principalUser.role,
          accountType: principalUser.accountType,
          sessionId: principalUser.sessionId,
          device: principalUser.device,
          location: principalUser.location,
          expiry: principalUser.expiry,
          tokenType: principalUser.tokenType,
        },
        this.privateKey,
        { algorithm: 'RS256', expiresIn: '30m' } // Token expiry of 30 minutes
      );

      this.logger.log('Saving token to Redis with key CMTRY_TOKEN_1');

     

      // Save token and related data to H2 database
      this.logger.log('Saving token and session data to database');
      const authSession = new AuthSession();
      authSession.redisKey = 'CMTRY_TOKEN_1';
      authSession.bearerToken = token;
      authSession.sessionId = principalUser.sessionId;
      authSession.expiry = new Date(Date.now() + 30 * 60000); // 30 minutes expiry

      await this.authSessionRepository.save(authSession);
      this.logger.log('Session data successfully saved to database');

      // Log the successful response
      this.logger.log(`Sending response with token and 30-minute expiry`);

      // Response with TokenResponse DTO
      return {
        statusCode : '0',
        token: token,
        expiresIn: '30 minutes',
      };
    } catch (error) {
      this.logger.error('Error generating token or saving session data', error.stack);
      throw error; // Re-throw the error after logging it
    }
  }
}