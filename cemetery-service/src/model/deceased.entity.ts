import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('cmn_tx_deceased')
@Unique(['deceasedId']) // Ensures deceasedId is unique
export class Deceased {
  @PrimaryGeneratedColumn({ name: 'SEQ_NO' }) // Single primary key with auto-increment
  seqNo: number;

  @Column({ name: 'DECEASED_ID', length: 50 })
  deceasedId: string;

  @Column({ name: 'LABEL_NAME', length: 100, nullable: true })
  labelName: string;

  @Column({ name: 'LNAME', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'FNAME', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'MNAME', length: 100, nullable: true })
  middleName: string;

  @Column({ name: 'SUFFIX', length: 10, nullable: true })
  suffix: string;

  @Column({ name: 'ADDRESS', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'BORN', length: 100, nullable: true })
  born: string;

  @Column({ name: 'DIED', length: 100, nullable: true })
  died: string;

  @Column({ name: 'CMTRY_LOC', length: 100, nullable: true })
  cemeteryLocation: string;

  @Column({ name: 'DATE_PERMIT', length: 100, nullable: true })
  datePermit: string;

  @Column({ name: 'NATURE_APP', length: 100, nullable: true })
  natureApp: string;

  @Column({ name: 'LAYER_NICHE', length: 50, nullable: true })
  layerNiche: string;

  @Column({ name: 'LAYER_ADDR', length: 50, nullable: true })
  layerAddress: string;

  // Payee information
  @Column({ name: 'PAYEE_LNAME', length: 100, nullable: true })
  payeeLastName: string;

  @Column({ name: 'PAYEE_FNAME', length: 100, nullable: true })
  payeeFirstName: string;

  @Column({ name: 'PAYEE_MNAME', length: 100, nullable: true })
  payeeMiddleName: string;

  @Column({ name: 'PAYEE_SUFFIX', length: 10, nullable: true })
  payeeSuffix: string;

  @Column({ name: 'PAYEE_CONTACT', length: 50, nullable: true })
  payeeContact: string;

  @Column({ name: 'PAYEE_EMAIL', length: 100, nullable: true })
  payeeEmail: string;

  @Column({ name: 'PAYEE_ADDRESS', type: 'text', nullable: true })
  payeeAddress: string;

  @Column({ name: 'OPT_1', length: 100, nullable: true })
  opt1: string;

  @Column({ name: 'OPT_2', length: 100, nullable: true })
  opt2: string;

  @Column({ name: 'REMARKS', type: 'text', nullable: true })
  remarks: string;

  @Column({ name: 'STATUS', default: 1 })
  status: number;

  @Column({ name: 'CANVAS_MAP', length: 4000, nullable: true })
  canvasMap: string;

  @Column({ name: 'REASON', length: 50, nullable: true })
  reason: string;

  @Column({ name: 'ADDED_BY', length: 50, nullable: true })
  addedBy: string;

  @Column({ name: 'ADDED_DATE', length: 100, nullable: true })
  addedDate: string;

  @Column({ name: 'MODIFIED_BY', length: 50, nullable: true })
  modifiedBy: string;

  @Column({ name: 'MODIFIED_DATE', length: 100, nullable: true })
  modifiedDate: string;
}
