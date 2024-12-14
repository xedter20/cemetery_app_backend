import { IsNotEmpty, IsString, ValidateNested, Length, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceDto {
  
  @ApiProperty({ description: 'Device type', example: 'mobile', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  type: string;

  @ApiProperty({ description: 'Browser used on the device', example: 'Chrome', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  browser: string;

  @ApiProperty({ description: 'Unique device identifier', example: '123e4567-e89b-12d3-a456-426614174000', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  uuid: string;

  @ApiProperty({ description: 'Device name', example: 'iPhone 12', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  name: string;
}

export class LoginDto {
  
  @ApiProperty({ description: 'User ID', example: 'user123', maxLength: 40, required: false })
  @IsOptional()  // Marks the field as optional
  @IsString()    // Ensures the field is a string if provided
  userId: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com', maxLength: 40 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123', maxLength: 40 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 40)
  password: string;

  @ApiProperty({ description: 'Device information', type: DeviceDto })
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @ApiProperty({ description: 'Location', example: 'New York', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  location: string;
}
