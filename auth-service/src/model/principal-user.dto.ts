import { IsNotEmpty, IsString } from 'class-validator';

export class PrincipalUser {
  
  id: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  accountType: string;

  sessionId: string;
 
  @IsString()
  device: string; // Ensure this matches your input, such as JSON.stringify'd device data


  @IsString()
  location: string;


  expiry: Date;

  @IsNotEmpty()
  @IsString()
  tokenType: string;
}