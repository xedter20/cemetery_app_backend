import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StatusDto {
  @ApiProperty({ description: 'Reason for the updating status', example: 'Retrieving records for verification purposes' })
  @IsNotEmpty({ message: 'Reason is required' })
  reason: string;
}