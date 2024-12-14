import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentDto } from './payment.dto';

export class PaymentResponseDto {
  
  @ApiProperty({ description: 'Status code of the response', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Message indicating the result of the request', example: 'Payments found successfully' })
  message: string;

  @ApiProperty({ description: 'Payment details (optional)', type: PaymentDto, nullable: true })
  payment?: PaymentDto;

  @ApiPropertyOptional({ description: 'List of payments (optional)', type: [PaymentDto], nullable: true })
  payments?: PaymentDto[] | null;

  @ApiPropertyOptional({ description: 'Pagination count for the payments list (optional)', example: 2, nullable: true })
  paginationCount?: number | null;

  @ApiPropertyOptional({ description: 'Pagination limit (optional)', example: 10, nullable: true })
  pageLimit?: number | null;
}