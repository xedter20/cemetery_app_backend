import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissionsss')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'EMAIL' })
  email: string;

  @Column({ name: 'ROLE' })
  role: string;

  @Column({ name: 'ACCOUNT_TYPE' })
  accountType: string;

  @Column({
    name: 'CAN_VIEW_LOCAL_ECONOMIC_ENTERPRISE',
    default: false,
    nullable: true,
  })
  canViewLocalEconomicEnterprise: boolean;

  @Column({
    name: 'CAN_VIEW_MUNICIPAL_TREASURER',
    default: false,
    nullable: true,
  })
  canViewMunicipalTreasurer: boolean;

  @Column({ name: 'CAN_VIEW_GUEST', default: false, nullable: true })
  canViewGuest: boolean;

  @Column({ name: 'CAN_VIEW_TOTAL_PAYMENT', default: false, nullable: true })
  canViewTotalPayment: boolean;

  @Column({ name: 'CAN_VIEW_USER_MANAGEMENT', default: false, nullable: true })
  canViewUserManagement: boolean;

  @Column({ name: 'CAN_VIEW_PROFILING', default: false, nullable: true })
  canViewProfiling: boolean;

  @Column({ name: 'CAN_VIEW_MAPPING', default: false, nullable: true })
  canViewMapping: boolean;

  @Column({ name: 'CAN_VIEW_NOTIFICATIONS', default: false, nullable: true })
  canViewNotifications: boolean;

  @Column({ name: 'CAN_VIEW_REPORTS', default: false, nullable: true })
  canViewReports: boolean;

  @Column({ name: 'CAN_VIEW_LOGS', default: false, nullable: true })
  canViewLogs: boolean;

  @Column({ name: 'CAN_VIEW_SEARCH_MAP', default: false, nullable: true })
  canViewSearchMap: boolean;

  // action columns
  @Column({
    name: 'ACTION_LOCAL_ECONOMIC_ENTERPRISE',
    type: 'text',
    nullable: true,
  })
  actionLocalEconomicEnterprise: string;

  @Column({ name: 'ACTION_MUNICIPAL_TREASURER', type: 'text', nullable: true })
  actionMunicipalTreasurer: string;

  @Column({ name: 'ACTION_GUEST', type: 'text', nullable: true })
  actionGuest: string;

  @Column({ name: 'ACTION_TOTAL_PAYMENT', type: 'text', nullable: true })
  actionTotalPayment: string;

  @Column({ name: 'ACTION_USER_MANAGEMENT', type: 'text', nullable: true })
  actionUserManagement: string;

  @Column({ name: 'ACTION_PROFILING', type: 'text', nullable: true })
  actionProfiling: string;

  @Column({ name: 'ACTION_MAPPING', type: 'text', nullable: true })
  actionMapping: string;

  @Column({ name: 'ACTION_NOTIFICATIONS', type: 'text', nullable: true })
  actionNotifications: string;

  @Column({ name: 'ACTION_REPORTS', type: 'text', nullable: true })
  actionReports: string;

  @Column({ name: 'ACTION_LOGS', type: 'text', nullable: true })
  actionLogs: string;

  @Column({ name: 'ACTION_SEARCH_MAP', type: 'text', nullable: true })
  actionSearchMap: string;

  @Column({ name: 'STATUS', type: 'int', default: 1 })
  status: number;

  @Column({ name: 'REASON', type: 'varchar', length: 255, nullable: true })
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
