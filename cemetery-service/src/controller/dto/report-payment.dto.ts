import { ApiProperty } from '@nestjs/swagger';
import { PaymentDto } from './payment.dto';

export class ReportPaymentDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  recordCount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  paginationTotal: number;

  @ApiProperty()
  currentPageRecordCount: number;

  @ApiProperty({ type: [PaymentDto] })
  payments: PaymentDto[];
}