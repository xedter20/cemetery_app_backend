import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../model/user.entity';
import { Permission } from '../../model/permission.entity';

export class UserWithPermissionResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  description;
  
}
