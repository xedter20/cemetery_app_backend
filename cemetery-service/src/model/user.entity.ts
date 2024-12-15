import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cmn_dm_usr' })
export class User {
  @PrimaryGeneratedColumn({ name: 'SEQ_NO' })
  seqNo: number;

  @Column({ name: 'ID', nullable: true })
  id: string;

  @Column({ name: 'USER_ID', nullable: true })
  userId: string;

  @Column({ name: 'ROLE' })
  role: string;

  @Column({ name: 'ACCOUNT_TYPE' })
  accountType: string;

  @Column({ name: 'FIRST_NAME' })
  firstName: string;

  @Column({ name: 'LAST_NAME' })
  lastName: string;

  @Column({ name: 'PASSWORD' })
  password: string;

  @Column({ name: 'EMAIL', nullable: true })
  email: string;

  @Column({ name: 'GENDER', nullable: true })
  gender: string;

  @Column({ name: 'DEVICE', nullable: true })
  device: string;

  @Column({ name: 'LOCATION', nullable: true })
  location: string;

  @Column({ name: 'STATUS', nullable: true })
  status: number;

  @Column({ name: 'REASON', nullable: true })
  reason: string;

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
