import { ApiProperty } from '@nestjs/swagger';
import { ActyLog } from '../../model/activity-log.entity';

export class ActivityLogResponseDto {
  
  @ApiProperty({ description: 'Status code of the response', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Message indicating the result of the request', example: 'Success' })
  message: string;

  @ApiProperty({ description: 'Number of pages for pagination', example: 5 })
  paginationCount: number;

  @ApiProperty({ description: 'Number of logs per page', example: 10 })
  pageLimit: number;

  @ApiProperty({ description: 'List of activity logs', type: [ActyLog] })
  logs: ActyLog[];
}