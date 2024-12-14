import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { conditionalColumn } from '../utils/conditionalColumn';

@Entity('AUTH_DM_SESSION')
export class AuthSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  redisKey: string;

  @Column()
  bearerToken: string;

  @Column()
  sessionId: string;

  @Column()
  expiry: Date;
}