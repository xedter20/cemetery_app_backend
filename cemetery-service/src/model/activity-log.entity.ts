import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ACTIVITY_LOGS')
export class ActyLog {
  @ApiProperty({ example: 1, description: 'The unique identifier for the log entry' })
  @PrimaryGeneratedColumn({ name: 'ID' })  
  id: number;  // Only primary key, and it will auto-increment

  @ApiProperty({ example: 'user123', description: 'The ID of the user who performed the action', maxLength: 50 })
  @Column({ name: 'USER_ID', length: 50 })  
  userId: string;

  @ApiProperty({ example: 'Login', description: 'The action performed by the user', maxLength: 100 })
  @Column({ name: 'ACTION', length: 100 })  
  action: string;

  @ApiProperty({ example: 'User Login', description: 'Optional label for the action', maxLength: 100, required: false })
  @Column({ name: 'LABEL', nullable: true, length: 100 })  
  label: string;

  @ApiProperty({ example: 'admin', description: 'The account type of the user', maxLength: 50, required: false })
  @Column({ name: 'ACCOUNT_TYPE', nullable: true, length: 50 })  
  accountType: string;

  @ApiProperty({ example: '2024-10-10 12:00:00', description: 'The date and time when the action was logged', type: 'string' })
  @Column({ name: 'CREATED_DATE', type: 'text', default: () => `(datetime('now', 'localtime'))`, nullable: true })
  createdDate: string;
}
