import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { User } from 'src/model/user.entity';

export class UserResponse {
  @ApiProperty({ example: 0 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({
    description: 'User details',
    type: 'object',
    nullable: true,
  })
  user?: Partial<User>;

  @ApiHideProperty()
  error?: string;
}