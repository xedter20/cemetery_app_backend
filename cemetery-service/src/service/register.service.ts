import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWithPermissionResponseDto } from '../controller/dto/user-with-permission-response.dto'; 
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';  

import { Permission } from '../model/permission.entity';
import { PrincipalUserService } from '../config/security/principal-user.service';
import { CreateUserDto } from '../controller/dto/create-user.dto'; 
import { User } from '../model/user.entity'; 
import { ActivityLog } from '../decorators/activity-log.decorator';
import { UnregisterResponse } from '../controller/dto/unregister-response.dto'; 
import { ActivityService } from '../service/activity.service';

@Injectable()
export class RegisterService {

  private readonly logger = new Logger(RegisterService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Permission)  
    private permissionRepository: Repository<Permission>,

    private readonly principalUserService: PrincipalUserService,

    private readonly activityService: ActivityService,
  ) {}

  
  @ActivityLog({ action: 'Create', label: 'Register' })
  async register(userData: CreateUserDto, accountType: string): Promise<UserWithPermissionResponseDto> {
    this.logger.log(`Inside register`);
  
    // Check if a user with the same email already exists
    const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
  
    if (existingUser) {
      throw new BadRequestException(`User with email ${userData.email} already exists.`);
    }
  
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

  
    // Manually map DTO fields to entity fields
    const newUser = this.userRepository.create({
      id: uuidv4(),
      role: 'role_user',
      firstName: userData.firstName,  
      lastName: userData.lastName,     
      userId: userData.email.split('@')[0],         
      email: userData.email,
      gender: userData.gender,
      password: hashedPassword,         
      device: JSON.stringify(userData.device), 
      location: userData.location,
      accountType,      
      status: 1,                
      addedBy: this.principalUserService.userId(),             
      addedDate: new Date().toISOString().slice(0, 19).replace('T', ' '), 
      modifiedBy: this.principalUserService.userId(),               
      modifiedDate: new Date().toISOString().slice(0, 19).replace('T', ' '),              
    });
  
    // Save the new user in the database
    const savedUser = await this.userRepository.save(newUser);
  
    // Set permission data based on account type
    let newPermission;
  
    if (accountType === 'guest') {
      newPermission = this.permissionRepository.create({
        email: savedUser.email,
        role: 'role_user',
        accountType: 'guest',
        canViewLocalEconomicEnterprise: false,
        canViewMunicipalTreasurer: false,
        canViewGuest: true,
        canViewTotalPayment: false,
        canViewUserManagement: false,
        canViewProfiling: false,
        canViewMapping: true,
        canViewNotifications: false,
        canViewReports: false,
        canViewLogs: false,
        canViewSearchMap: true,
        actionLocalEconomicEnterprise: '',
        actionMunicipalTreasurer: '',
        actionGuest: '',
        actionTotalPayment: '',
        actionUserManagement: '',
        actionProfiling: '',
        actionMapping: 'search',
        actionNotifications: '',
        actionReports: '',
        actionLogs: '',
        actionSearchMap: 'search',
        status: 1,  // Active status
        reason: null,  
        addedBy: this.principalUserService.userId(),  
        addedDate: new Date().toISOString(), 
        modifiedBy: this.principalUserService.userId(), 
        modifiedDate: new Date().toISOString(),
      });


    } else if (accountType === 'treasurer') {
      newPermission = this.permissionRepository.create({
        email: savedUser.email,
        role: 'role_user',
        accountType: 'treasurer',
        canViewLocalEconomicEnterprise: true,
        canViewMunicipalTreasurer: true,
        canViewGuest: false,
        canViewTotalPayment: true,
        canViewUserManagement: true,
        canViewProfiling: true,
        canViewMapping: true,
        canViewNotifications: true,
        canViewReports: true,
        canViewLogs: true,
        actionLocalEconomicEnterprise: 'add|edit|delete',
        actionMunicipalTreasurer: 'add|edit|delete',
        actionGuest: 'add|edit|delete',
        actionTotalPayment: 'download|search',
        actionUserManagement: 'add|edit|delete|search',
        actionProfiling: 'add|edit|delete|search',
        actionMapping: 'add|edit|search',
        actionNotifications: 'search',
        actionReports: 'search|download',
        actionLogs: 'search',
        actionSearchMap: 'search',
        status: 1,  
        reason: null,  
        addedBy: this.principalUserService.userId(),  
        addedDate: new Date().toISOString(), 
        modifiedBy: this.principalUserService.userId(), 
        modifiedDate: new Date().toISOString(),
      });

    } else if (accountType === 'admin') {
      newPermission = this.permissionRepository.create({
        email: savedUser.email,
        role: 'role_admin',
        accountType: 'admin',
        canViewLocalEconomicEnterprise: true,
        canViewMunicipalTreasurer: true,
        canViewGuest: false,
        canViewTotalPayment: true,
        canViewUserManagement: true,
        canViewProfiling: true,
        canViewMapping: true,
        canViewNotifications: true,
        canViewReports: true,
        canViewLogs: true,
        actionLocalEconomicEnterprise: 'add|edit|delete',
        actionMunicipalTreasurer: 'add|edit|delete',
        actionGuest: 'add|edit|delete',
        actionTotalPayment: 'download|search',
        actionUserManagement: 'add|edit|delete|search',
        actionProfiling: 'add|edit|delete|search',
        actionMapping: 'add|edit|search',
        actionNotifications: 'search',
        actionReports: 'search|download',
        actionLogs: 'search',
        actionSearchMap: 'search',
        status: 1,  
        reason: null,  
        addedBy: this.principalUserService.userId(),  
        addedDate: new Date().toISOString(), 
        modifiedBy: this.principalUserService.userId(), 
        modifiedDate: new Date().toISOString(),
      });
    } 

    
    else if (accountType === 'enterprise') {
      newPermission = this.permissionRepository.create({
        email: savedUser.email,
        role: 'role_user',
        accountType: 'enterprise',
        canViewLocalEconomicEnterprise: true,
        canViewMunicipalTreasurer: false,
        canViewGuest: false,
        canViewTotalPayment: true,
        canViewUserManagement: false,
        canViewProfiling: true,
        canViewMapping: true,
        canViewNotifications: false,
        canViewReports: false,
        canViewLogs: false,
        actionLocalEconomicEnterprise: 'add|edit|delete',
        actionMunicipalTreasurer: '',
        actionGuest: '',
        actionTotalPayment: 'download|search',
        actionProfiling: 'add|edit|delete|search',
        actionMapping: 'add|edit|search',
        actionNotifications: '',
        actionReports: '',
        actionLogs: '',
        actionSearchMap: 'search',
        status: 1,  
        reason: null,  
        addedBy: this.principalUserService.userId(),  
        addedDate: new Date().toISOString(), 
        modifiedBy: this.principalUserService.userId(), 
        modifiedDate: new Date().toISOString(),
      });
    } else {
      throw new BadRequestException('Invalid account type');
    }
  
    // Save the new permission entry in the database
    const savedPermission = await this.permissionRepository.save(newPermission);
  
    // Return the saved user and permission together
    return {
      statusCode: 200,
      message: 'Successful',
      description: `User registered as ${accountType}`
    };
  }

  @ActivityLog({ action: 'Delete', label: 'Register' })
  async unregister(email: string, reason: string): Promise<UnregisterResponse> {
    this.logger.log(`Inside unregister`);

    // Validate email and reason fields
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Reason is required');
    }

    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });

    // If user is not found, throw an exception
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // If the user is already unregistered, throw an exception
    if (user.status === 99) {
      throw new BadRequestException(`User with email ${email} is already unregistered`);
    }

    // Set the status to 99 (unregistered), add the reason, modifiedBy, and modifiedDate
    user.status = 99;
    user.reason = reason;
    user.modifiedBy = this.principalUserService.email();  // Get the email of the user performing the modification
    const currentDateTime = new Date().toISOString();  // Current date-time in ISO format
    user.modifiedDate = currentDateTime;

    // Save the updated user entity
    await this.userRepository.save(user);

    // Return the UnregisterResponse
    return {
      statusCode: 200,
      message: 'Successful',
      email: user.email,
      dateTime: currentDateTime,
    };
  }
}