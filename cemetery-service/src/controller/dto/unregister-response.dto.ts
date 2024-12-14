import { ApiProperty } from '@nestjs/swagger';

export class UnregisterResponse {
  @ApiProperty({ example: 0, description: 'Status code of the operation' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Message of the operation' })
  message: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the unregistered user',
  })
  email: string;

  @ApiProperty({
    example: '2024-10-10T15:30:00',
    description: 'Date and time when the unregistration was processed',
  })
  dateTime: string;
}
