import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { conditionalColumn } from '../utils/conditionalColumn';

@Entity('auth_dm_session')
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
