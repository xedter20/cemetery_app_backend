import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity';
import { Permission } from '../model/permission.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminInsertService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,  // Inject Permission repository
  ) {}

  async insertAdmin(): Promise<void> {
    const adminEmail = 'admin@guimaras-cemetery.com';

    // Check if admin user already exists
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('Admin user already exists. No need to insert.');
      return;
    }

    // Hash password
    const password = 'Password12345678';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const adminUser = this.userRepository.create({
      id: uuidv4(),
      userId: 'admin',
      role: 'role_admin',
      accountType: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      email: adminEmail,
      gender: 'M',
      status: 1,
      addedBy: 'SYSTEM',
      addedDate: new Date().toISOString(),
      modifiedBy: 'SYSTEM',
      modifiedDate: new Date().toISOString(),
    });

    // Save admin user to the database
    await this.userRepository.save(adminUser);
    console.log('Admin user inserted successfully.');

    // Now add permissions for the admin user
    const adminPermissions = this.permissionRepository.create({
      id: uuidv4(),
      email: adminEmail,
      role: 'role_admin',
      accountType: 'admin',
      canViewLocalEconomicEnterprise: true,
      canViewMunicipalTreasurer: true,
      canViewGuest: true,
      canViewTotalPayment: true,
      canViewUserManagement: true,
      canViewProfiling: true,
      canViewMapping: true,
      canViewNotifications: true,
      canViewReports: true,
      canViewLogs: true,
      canViewSearchMap: true,

      actionLocalEconomicEnterprise: 'view|create|update|delete',
      actionMunicipalTreasurer: 'view|create|update|delete',
      actionGuest: 'view|create|update|delete',
      actionTotalPayment: 'view|create|update|delete',
      actionUserManagement: 'view|create|update|delete',
      actionProfiling: 'view|create|update|delete',
      actionMapping: 'view|create|update|delete',
      actionNotifications: 'view|create|update|delete',
      actionReports: 'view|create|update|delete',
      actionLogs: 'view|create|update|delete',
      actionSearchMap: 'view|create|update|delete',

      status: 1,
      addedBy: 'SYSTEM',
      addedDate: new Date().toISOString(),
      modifiedBy: 'SYSTEM',
      modifiedDate: new Date().toISOString(),
    });

    // Save admin permissions to the database
    await this.permissionRepository.save(adminPermissions);
    console.log('Admin permissions inserted successfully.');
  }
}
