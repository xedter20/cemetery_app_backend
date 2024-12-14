import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/model/user.entity';

export class UserList {
  @ApiProperty({ example: 0 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 2 })
  paginationCount: number;

  @ApiProperty({ example: 10 })
  pageLimit: number;

  @ApiProperty({
    description: 'List of users',
    type: 'array',
    items: { 
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        accountType: { type: 'string' },
      },
    },
  })
  list: Partial<User>[];
}
