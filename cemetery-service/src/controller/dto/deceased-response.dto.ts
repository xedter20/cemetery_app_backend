import { Deceased } from '../../model/deceased.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DeceasedResponse {
  @ApiProperty({ description: 'The status code of the response', example: 200 })
  statusCode: number;

  @ApiProperty({
    description: 'The message indicating the result of the operation',
    example: 'Deceased record created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The ID of the deceased (optional)',
    example: 'd12345',
    required: false,
  })
  deceased_id?: string;

  @ApiProperty({
    description: 'The single deceased entity (optional)',
    type: () => Deceased,
    nullable: true,
  })
  deceased?: Deceased | null;

  @ApiProperty({
    description: 'List of deceased entities or an empty array if none found',
    type: () => [Deceased],
    nullable: true,
  })
  deceasedList?: Deceased[] | null;
}
