import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/model/user.entity';

export class TokenResponse {
  @ApiProperty({ description: 'Status code of the response', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Generated authentication token', example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  token: string;

  @ApiProperty({ description: 'Expiration time for the token', example: '900' })
  expiresIn: string;

  @ApiProperty({ description: 'User permissions object', example: '{}' })
  permissions: any;  // Permissions field to include permission details

  @ApiProperty({ description: 'User details object', type: User })
  user: Partial<User>;  // User details field
}