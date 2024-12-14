import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Unregister {
  @ApiProperty({ description: 'Reason for unregistering', example: 'No longer needed' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100, { message: 'Reason must be between 1 and 100 characters' }) 
  reason: string;
}