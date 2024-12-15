import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { HttpModule } from '@nestjs/axios';

// dev section
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthSession } from './model/auth-session.entity';
import { nativePassword } from 'mysql/lib/protocol/Auth';

import { createConnection } from 'mysql2';
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

    // host: 'jcqlf1.stackhero-network.com',
    // user: 'root',
    // password: 'OwhHbxDtBwsDB9VlClLwfkzw9MTBr70m',
    // database: 'avdeasis',
    // port: 4300,

    TypeOrmModule.forRoot({
      driver: createConnection,
      type: 'mysql', // Use MySQL as the database type
      host: 'jcqlf1.stackhero-network.com', // MySQL server host
      port: 4300, // MySQL server port
      username: 'root', // MySQL username
      password: 'OwhHbxDtBwsDB9VlClLwfkzw9MTBr70m', // MySQL password
      database: 'cemetery_db', // MySQL database name
      synchronize: false, // Automatically sync schema to database (set to false in production)
      logging: true, // Enable logging for troubleshooting
      entities: [AuthSession], // Register the AuthSession entity
      // extra: {
      //   waitForConnections: true,
      //   connectionLimit: 10,
      //   queueLimit: 0,
      //   ssl: false,
      //   // authPlugins: {
      //   //   mysql_native_password: nativePassword,
      //   // },
      // },
    }),

    TypeOrmModule.forFeature([AuthSession]),

    // HTTP Module to communicate with cemetery-db-lite Spring Boot service
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService],
})
export class AuthModule {}
