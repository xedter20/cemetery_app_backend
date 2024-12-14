import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RegisterService } from './service/register.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path'; // Ensure path is correctly imported
import { User } from './model/user.entity';
import { Permission } from './model/permission.entity';
import { Deceased } from './model/deceased.entity';
import { Payment } from './model/payment.entity';
import { ActyLog } from './model/activity-log.entity';

import { AdminController } from './controller/admin.controller';
import { RegisterController } from './controller/register.controller';
import { GuestController } from './controller/guest.controller';

import { GuestService } from './service/guest.service';
import { AdminService } from './service/admin.service';
import { HasAuthorityService } from './service/has-authority.service';
import { HttpLoggingInterceptor } from './config/logger/http-logging.interceptor';
import { PrincipalUserService } from './config/security/principal-user.service';
import { ActivityService } from './service/activity.service';
import { AdminInsertService } from './service/admin-insert.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: configService.get<string>('DATABASE_URL'),
    //     username: configService.get<string>('DATABASE_USERNAME'),
    //     password: configService.get<string>('DATABASE_PASSWORD'),
    //     database: configService.get<string>('DATABASE_SCHEMA'),
    //     logging: true,
    //     entities: [User, Permission, Deceased, Payment, ActyLog],
    //     synchronize: true,
    //   }),
    // }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'C:/DexDev/sqlite/data/testdb', // Path to H2 database
      synchronize: true, // Automatically sync schema to database
      logging: true, // Enable logging for troubleshooting
      entities: [User, Permission, Deceased, Payment, ActyLog], // Register the AuthSession entity
    }),

    TypeOrmModule.forFeature([User, Permission, Deceased, Payment, ActyLog]),
    HttpModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const privateKeyPath = './../keys/private.pem'; // Default path if not set
        const publicKeyPath = './../keys/public.pem'; // Default path if not set

        let privateKey: string;
        let publicKey: string;

        try {
          privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
          publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
          console.log('Private key and public key loaded successfully.');
        } catch (error) {
          console.error('Error loading keys:', error);
          throw new Error('Failed to load private/public keys');
        }

        return {
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256', expiresIn: '1h' },
          verifyOptions: { algorithms: ['RS256'] },
        };
      },
    }),
  ],

  controllers: [AdminController, RegisterController, GuestController],
  providers: [
    AdminService,
    RegisterService,
    HttpLoggingInterceptor,
    PrincipalUserService,
    HasAuthorityService,
    GuestService,
    ActivityService,
    AdminInsertService,
  ],
})
export class CemeteryModule {}
