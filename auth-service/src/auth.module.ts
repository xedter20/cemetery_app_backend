import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { HttpModule } from '@nestjs/axios';

// dev section
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthSession } from './model/auth-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthSession]),
    // Global config with .env file
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
    //     entities: [AuthSession],
    //     synchronize: true,
    //   }),
    // }),
    // TypeORM for H2 database connection

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database:
        'C:/Users/machr/CEMETERY/cemetery-be/cemetery-db-lite/data/testdb', // Path to H2 database
      synchronize: true, // Automatically sync schema to database
      logging: true, // Enable logging for troubleshooting
      entities: [AuthSession], // Register the AuthSession entity
    }),

    TypeOrmModule.forFeature([AuthSession]),

    // HTTP Module to communicate with cemetery-db-lite Spring Boot service
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService],
})
export class AuthModule {}
