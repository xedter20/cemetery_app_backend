import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cmn_tx_payment')
export class Payment {
  @PrimaryGeneratedColumn()
  SEQ_NO: number;

  @Column({ name: 'DECEASED_ID' })
  deceasedId: string;

  @Column({ name: 'DECEASED_NAME' })
  deceasedName: string;

  @Column({ name: 'DATE_PAID' })
  datePaid: Date;

  @Column({ name: 'KIND_PAYMENT' })
  kindPayment: string;

  @Column({ name: 'PERMIT_NO' })
  permitNo: string;

  @Column({ name: 'ORDER_NO' })
  orderNo: string;

  @Column({ name: 'AMOUNT' })
  amount: number;

  @Column({ name: 'NUM_YEARS_PAY' })
  numYearsPay: number;

  @Column({ name: 'NEXT_PAYMENT_DATE' })
  nextPaymentDate: Date;

  @Column({ name: 'REASON', nullable: true })
  reason: string;

  @Column({ name: 'STATUS' })
  status: number;

  @Column({ name: 'ADDED_BY', nullable: true })
  addedBy: string;

  @Column({
    name: 'ADDED_DATE',
    type: 'text',
    default: () => `(datetime('now', 'localtime'))`,
    nullable: true,
  })
  addedDate: string;

  @Column({ name: 'MODIFIED_BY', nullable: true })
  modifiedBy: string;

  @Column({
    name: 'MODIFIED_DATE',
    type: 'text',
    default: () => `(datetime('now', 'localtime'))`,
    nullable: true,
  })
  modifiedDate: string;
}
