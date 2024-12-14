import { IsNotEmpty, IsEmail, IsString, ValidateNested, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeviceDto {
  @ApiProperty({ description: 'Device type', example: 'Mobile', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  type: string;

  @ApiProperty({ description: 'Browser name', example: 'Chrome', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  browser: string;

  @ApiProperty({ description: 'Unique device ID', example: '1234-5678-9101', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  uuid: string;

  @ApiProperty({ description: 'Device name', example: 'iPhone 12', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  name: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'User role', example: 'admin', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  role: string;

  @ApiProperty({ description: 'First name of the user', example: 'John', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  lastName: string;

  @ApiProperty({ description: 'User email address (must follow the format: example@domain.com)', example: 'john.doe@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid format (e.g., example@domain.com)' }) 
  email: string;

  @ApiProperty({ description: 'User password', example: 'strongPassword123!' })
  @IsNotEmpty()
  @IsString()
  @Length(8, 100)  // Minimum 8 characters, maximum 50
  password: string;

  @ApiProperty({ description: 'User gender', example: 'male', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  gender: string;

  @ApiProperty({ description: 'Device details', type: DeviceDto })
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ApiProperty({ description: 'User location', example: 'New York', maxLength: 50 })
  @IsString()
  @Length(1, 50)  // Limiting length to 50 characters
  @Matches(/^[a-zA-Z0-9\s]*$/, { message: 'Location must not contain special characters' })  // No special characters allowed
  location: string;
}
