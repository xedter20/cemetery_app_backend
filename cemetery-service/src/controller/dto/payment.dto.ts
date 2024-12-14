import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsOptional } from 'class-validator';

export class PaymentDto {

  @ApiProperty({ description: 'Full name of the deceased', example: 'John Doe' })
  @MaxLength(80, { message: 'Deceased name cannot exceed 80 characters' })
  deceasedName: string;

  @ApiProperty({ description: 'Date when the payment was made', example: '2024-10-10' })
  datePaid: Date; // Frontend will pass this as a Date object

  @ApiProperty({ description: 'Type of payment made', example: 'Rental Payment' })
  @MaxLength(80, { message: 'Payment type cannot exceed 80 characters' })
  kindPayment: string;

  @ApiProperty({ description: 'Permit number associated with the payment', example: 'PN-12345' })
  @MaxLength(80, { message: 'Permit number cannot exceed 80 characters' })
  permitNo: string;

  @ApiProperty({ description: 'Order number of the payment', example: 'ORD-56789' })
  @MaxLength(80, { message: 'Order number cannot exceed 80 characters' })
  orderNo: string;

  @ApiProperty({ description: 'Amount paid', example: 500.00 })
  amount: number;

  @ApiProperty({ description: 'Number of years paid for', example: 2 })
  numYearsPay: number;

  @ApiProperty({ description: 'Next payment due date', example: '2025-10-10' })
  nextPaymentDate: Date; // Frontend will pass this as a Date object

  @ApiProperty({ description: 'Status of the payment', example: 1 })
  status: number;

  @ApiProperty({ description: 'Reason for the payment', example: 'Annual subscription' })
  @IsOptional() 
  @MaxLength(80, { message: 'Reason cannot exceed 80 characters' })
  reason: string;

  @ApiProperty({ description: 'User who added the payment', example: 'admin@company.com' })
  @MaxLength(80, { message: 'Added by cannot exceed 80 characters' })
  addedBy: string;

  @ApiProperty({ description: 'Date when the payment was added', example: '2024-10-10 10:00:00' })
  addedDate: string;

  @ApiProperty({ description: 'User who last modified the payment', example: 'admin@company.com' })
  @MaxLength(80, { message: 'Modified by cannot exceed 80 characters' })
  modifiedBy: string;

  @ApiProperty({ description: 'Date when the payment was last modified', example: '2024-10-12 10:00:00', nullable: true })
  modifiedDate: string | null;
}
