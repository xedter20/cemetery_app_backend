import { DeceasedDto } from './deceased.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DeceasedList {
  @ApiProperty({ description: 'Status code indicating the success of the request', example: 0 })
  statusCode: number;

  @ApiProperty({ description: 'Message providing additional details about the request', example: 'Successful' })
  message: string;

  @ApiProperty({ description: 'Page Number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Page limit', example: 10 })
  pageLimit: number;

  @ApiProperty({ description: 'Total number of pages available based on the pagination', example: 5 })
  paginationCount: number;

  @ApiProperty({ description: 'List of deceased records', type: [DeceasedDto] })
  deceased: DeceasedDto[];
}