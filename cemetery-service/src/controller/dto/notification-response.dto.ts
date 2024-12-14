import { ApiProperty } from '@nestjs/swagger';

export class DeceasedNotificationDto {
  @ApiProperty({ description: 'Deceased Name' })
  deceasedName: string;

  @ApiProperty({ description: 'Deceased ID', example: 'hidden' })
  deceasedId: string;  // Hidden but available in response

  @ApiProperty({ description: 'Amount to be paid' })
  amount: number;

  @ApiProperty({ description: 'Email of the deceased contact person' })
  email: string;

  @ApiProperty({ description: 'Next payment due date' })
  nextPaymentDate: Date;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Status code indicating the success of the request', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Message providing additional details about the request', example: 'Successful' })
  message: string;

  @ApiProperty({ description: 'Total number of pages available based on the pagination', example: 5 })
  paginationCount: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageLimit: number;

  @ApiProperty({ description: 'List of deceased records with their payment details', type: [DeceasedNotificationDto] })
  deceased: DeceasedNotificationDto[];
}