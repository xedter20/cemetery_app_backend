import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

// dev resource
import { Permission } from '../model/permission.entity';
import { User } from '../model/user.entity';
import { LoginDto } from '../controller/dto/login.dto';
import { TokenResponse } from '../controller/dto/token-response.dto';
import { PrincipalUserService } from '../config/security/principal-user.service';
import { Deceased } from '../model/deceased.entity';
import { DeceasedDto } from '../controller/dto/deceased.dto';
import { DeceasedResponse } from '../controller/dto/deceased-response.dto';
import { Payment } from '../model/payment.entity';
import { PaymentDto } from '../controller/dto/payment.dto';
import { PaymentResponseDto } from '../controller/dto/payment-response.dto';
import { ReportPaymentDto } from '../controller/dto/report-payment.dto';
import { ActyLog } from '../model/activity-log.entity';
import { ActivityLog } from '../decorators/activity-log.decorator';
import { DeceasedList } from 'src/controller/dto/deceased-list.dto';
import { ActivityService } from '../service/activity.service';
import { UserList } from '../controller/dto/user-list.dto';
import { UserResponse } from 'src/controller/dto/user-response.dto';
import { AccountType } from 'src/enums/account-type.enum';
import { ActivityLogResponseDto } from 'src/controller/dto/activity-log-response.dto';
import { NotificationResponseDto } from 'src/controller/dto/notification-response.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ActyLog)
    private readonly activityLogRepository: Repository<ActyLog>,
    private readonly httpService: HttpService,
    private readonly principalUserService: PrincipalUserService,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
  ) {}

  @ActivityLog({ action: 'Login', label: 'Login Admin' })
  async login(loginData: LoginDto): Promise<TokenResponse> {
    this.logger.log(`Inside login admin`);

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Fetch user permissions
    const permission = await this.permissionRepository.findOneBy({
      email: user.email,
      status: 1,
    });
    if (!permission) {
      throw new ForbiddenException('Permissions not found');
    }

    // Prepare the PrincipalUser for the auth-service
    const principalUser = {
      id: user.id,
      firstname: user.firstName,
      lastname: user.lastName,
      userId: user.userId,
      accountType: user.accountType,
      email: loginData.email || user.email,
      role: user.role,
      sessionId: uuidv4(),
      device: loginData.device || user.device,
      location: loginData.location || user.location,
      expiry: new Date(Date.now() + 30 * 60000), // Token expiration time (30 minutes)
      tokenType: 'login',
    };

    try {
      // Call the auth-service to generate a token
      // const authServiceUrl = 'http://localhost:3001';

      const authServiceUrl = 'https://cemetery-app-backend.onrender.com';
      const response = await firstValueFrom(
        this.httpService.post(`${authServiceUrl}/auth/generate`, principalUser),
      );

      if (!response || response.data.statusCode !== '0') {
        throw new ServiceUnavailableException(
          'Auth service offline or invalid response',
        );
      }

      // Prepare the permission object similar to getPermissions method
      const permissions = {
        canViewLocalEconomicEnterprise:
          permission.canViewLocalEconomicEnterprise,
        canViewMunicipalTreasurer: permission.canViewMunicipalTreasurer,
        canViewGuest: permission.canViewGuest,
        canViewTotalPayment: permission.canViewTotalPayment,
        canViewUserManagement: permission.canViewUserManagement,
        canViewProfiling: permission.canViewProfiling,
        canViewMapping: permission.canViewMapping,
        canViewNotifications: permission.canViewNotifications,
        canViewReports: permission.canViewReports,
        canViewLogs: permission.canViewLogs,
        canViewSearchMap: permission.canViewSearchMap,

        actionLocalEconomicEnterprise:
          permission.actionLocalEconomicEnterprise || '',
        actionMunicipalTreasurer: permission.actionMunicipalTreasurer || '',
        actionGuest: permission.actionGuest || '',
        actionTotalPayment: permission.actionTotalPayment || '',
        actionUserManagement: permission.actionUserManagement || '',
        actionProfiling: permission.actionProfiling || '',
        actionMapping: permission.actionMapping || '',
        actionNotifications: permission.actionNotifications || '',
        actionReports: permission.actionReports || '',
        actionLogs: permission.actionLogs || '',
        actionSearchMap: permission.actionSearchMap || '',
      };

      // Construct the response with token, user, and permissions
      const tokenResponse: TokenResponse = {
        statusCode: 200,
        token: response.data.token,
        expiresIn: response.data.expiresIn,
        permissions, // Include the permissions in the response
        user: {
          // Add user information in the response
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          location: user.location,
        },
      };

      return tokenResponse;
    } catch (error) {
      throw new ServiceUnavailableException(
        'Auth service offline or unavailabless',
      );
    }
  }

  async getPermissions() {
    this.logger.log(`Inside getPermission admin`);
    const principalUser = this.principalUserService.getPrincipalUser();
    const permission = await this.permissionRepository.findOneBy({
      email: principalUser.email,
      status: 1,
    });

    if (!permission) {
      throw new ForbiddenException('Permissions not found');
    }

    // Check if the user is an admin with the staff account type
    if (
      permission.role === 'role_user' ||
      permission.accountType === 'role_admin'
    ) {
      return {
        canViewLocalEconomicEnterprise:
          permission.canViewLocalEconomicEnterprise,
        canViewMunicipalTreasurer: permission.canViewMunicipalTreasurer,
        canViewGuest: permission.canViewGuest,
        canViewTotalPayment: permission.canViewTotalPayment,
        canViewUserManagement: permission.canViewUserManagement,
        canViewProfiling: permission.canViewProfiling,
        canViewMapping: permission.canViewMapping,
        canViewNotifications: permission.canViewNotifications,
        canViewReports: permission.canViewReports,
        canViewLogs: permission.canViewLogs,
        canViewSearchMap: permission.canViewSearchMap,

        actionLocalEconomicEnterprise:
          permission.actionLocalEconomicEnterprise || '',
        actionMunicipalTreasurer: permission.actionMunicipalTreasurer || '',
        actionGuest: permission.actionGuest || '',
        actionTotalPayment: permission.actionTotalPayment || '',
        actionUserManagement: permission.actionUserManagement || '',
        actionProfiling: permission.actionProfiling || '',
        actionMapping: permission.actionMapping || '',
        actionNotifications: permission.actionNotifications || '',
        actionReports: permission.actionReports || '',
        actionLogs: permission.actionLogs || '',
        actionSearchMap: permission.actionSearchMap || '',
      };
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private async checkIfGuest(): Promise<void> {
    const currentUser = await this.userRepository.findOne({
      where: { email: this.principalUserService.email() },
    });
    if (currentUser?.accountType === 'guest') {
      throw new ForbiddenException(
        'Not allowed: guest users cannot access this resource',
      );
    }
  }

  // PERSONNEL

  @ActivityLog({ action: 'Search', label: 'User Management Search' })
  async getUsersByAccountType(
    accountTypes: AccountType | AccountType[],
    page = 1,
    limit = 10,
  ): Promise<UserList> {
    this.logger.log(`Inside getUsersByAccountType`);

    const pageLimit = 10;

    // Use an array to allow multiple account types
    const whereCondition = Array.isArray(accountTypes)
      ? { accountType: In(accountTypes), status: 1 }
      : { accountType: accountTypes, status: 1 };

    // Fetch users sorted by seqNo in descending order
    const [users, total] = await this.userRepository.findAndCount({
      // where: whereCondition,
      order: { seqNo: 'DESC' }, // Sort by seqNo in descending order
      take: pageLimit,
      skip: (page - 1) * pageLimit,
    });

    const paginationCount = Math.ceil(total / pageLimit);

    return {
      statusCode: 200,
      message: 'Success',
      paginationCount,
      pageLimit,
      list: users.map((user) => ({
        id: user.id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        email: user.email,
      })),
    };
  }

  @ActivityLog({ action: 'View', label: 'User Management By ID' })
  async getUserById(id: string): Promise<UserResponse> {
    this.logger.log(`Inside getUserById`);

    await this.checkIfGuest();

    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    return {
      statusCode: 200,
      message: 'Success',
      user: user ? { ...user } : undefined, // `user` will be undefined if null, so it won't show up in the response
    };
  }

  @ActivityLog({ action: 'Update', label: 'User Management By ID' })
  async updateUserById(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserResponse> {
    this.logger.log(`Inside updateUserById`);

    // Ensure guests can't access this
    await this.checkIfGuest();

    // Fetch the existing user to preserve fields that should not be updated
    const existingUser = await this.userRepository.findOne({ where: { id } });

    if (!existingUser) {
      return { statusCode: 404, message: 'User not found' };
    }

    // If the password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Build the update data excluding fields that shouldn't be updated
    const fieldsToUpdate = {
      firstName: updateData.firstName || existingUser.firstName,
      lastName: updateData.lastName || existingUser.lastName,
      email: updateData.email || existingUser.email,
      password: updateData.password || existingUser.password, // Use hashed password if provided
      gender: updateData.gender || existingUser.gender,
      device: updateData.device || existingUser.device,
      location: updateData.location || existingUser.location,
      modifiedBy: this.principalUserService.userId(), // Set modified by current user
      modifiedDate: new Date().toISOString(), // Set current timestamp
    };

    // Update user but prevent changes to seqNo, id, status, addedBy, and addedDate
    await this.userRepository.update({ id }, fieldsToUpdate);

    return { statusCode: 200, message: 'Success' };
  }

  @ActivityLog({ action: 'Delete', label: 'User Management By ID' })
  async deleteUserById(id: string, reason: string): Promise<UserResponse> {
    this.logger.log(`Inside deleteUserById`);

    // Ensure guests can't access this
    await this.checkIfGuest();

    // Check if the reason is provided
    if (!reason || reason.trim() === '') {
      return { statusCode: 400, message: 'Reason for deletion is required' };
    }

    // Update the user status to 99 and include the reason
    await this.userRepository.update(
      { id },
      {
        status: 99,
        reason, // Add the reason for deletion
        modifiedBy: this.principalUserService.userId(),
        modifiedDate: new Date().toISOString(),
      },
    );

    return { statusCode: 200, message: 'User marked as deleted' };
  }

  // PROFILING

  @ActivityLog({ action: 'Create', label: 'Profiling' })
  async createDeceased(deceasedDto: DeceasedDto): Promise<DeceasedResponse> {
    this.logger.log(`Inside createDeceased`);
    await this.checkIfGuest();

    // Check if a deceased record already exists with the same firstName, lastName, middleName, born, and died (case insensitive)
    const existingDeceased = await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where('LOWER(deceased.firstName) = LOWER(:firstName)', {
        firstName: deceasedDto.firstName,
      })
      .andWhere('LOWER(deceased.lastName) = LOWER(:lastName)', {
        lastName: deceasedDto.lastName,
      })
      .andWhere('LOWER(deceased.middleName) = LOWER(:middleName)', {
        middleName: deceasedDto.middleName,
      })
      .andWhere('deceased.born = :born', { born: deceasedDto.born })
      .andWhere('deceased.died = :died', { died: deceasedDto.died })
      .getOne();

    // Throw an error if such a record exists
    if (existingDeceased) {
      throw new BadRequestException(
        'A deceased record with the same name and dates already exists.',
      );
    }

    // Generate UUID for deceasedId
    const deceasedId = uuidv4();

    // Create a new deceased entity and set additional properties
    const deceased = this.deceasedRepository.create({
      ...deceasedDto,
      deceasedId, // Set the generated UUID as the deceasedId
      addedBy: this.principalUserService.userId(),
      addedDate: new Date().toISOString(),
      modifiedBy: this.principalUserService.userId(),
      modifiedDate: new Date().toISOString(),
    });

    // Save the new deceased entity to the database
    await this.deceasedRepository.save(deceased);

    return {
      statusCode: 200,
      message: 'Deceased record created successfully',
      deceased, // Include the deceased entity in the response
    };
  }

  @ActivityLog({ action: 'View', label: 'Profiling By ID' })
  async getDeceasedByDeceasedId(deceasedId: string): Promise<DeceasedResponse> {
    this.logger.log(`Fetching deceased profile for ID: ${deceasedId}`);
    await this.checkIfGuest();

    // Fetch deceased profile by deceasedId
    const deceased = await this.deceasedRepository.findOne({
      where: { deceasedId },
    });

    // If no deceased profile is found, throw a NotFoundException
    if (!deceased) {
      throw new NotFoundException(
        `Deceased profile with ID ${deceasedId} not found`,
      );
    }

    // Return the deceased profile in the response format
    return {
      statusCode: 200,
      message: 'Deceased profile found successfully',
      deceased: deceased,
    };
  }

  @ActivityLog({ action: 'Update', label: 'Profiling' })
  async updateDeceased(
    deceasedId: string,
    deceasedDto: DeceasedDto,
  ): Promise<DeceasedResponse> {
    this.logger.log(`Inside updateDeceased`);
    await this.checkIfGuest();

    // Retrieve the current entity first
    const deceasedToUpdate = await this.deceasedRepository.findOne({
      where: { deceasedId },
    });

    if (!deceasedToUpdate) {
      return {
        statusCode: 417,
        message: 'Deceased record not found',
        deceased: null,
      };
    }

    await this.deceasedRepository.update(
      { deceasedId },
      {
        ...deceasedDto,
        modifiedBy: this.principalUserService.userId(),
        modifiedDate: new Date().toISOString(),
      },
    );

    const updatedDeceased = await this.deceasedRepository.findOne({
      where: { deceasedId },
    });

    return {
      statusCode: 200,
      message: 'Deceased record updated successfully',
      deceased: updatedDeceased || null,
    };
  }

  @ActivityLog({ action: 'View', label: 'Profiling' })
  async getAllDeceased(page = 1, limit = 10): Promise<DeceasedList> {
    this.logger.log(`Inside getAllDeceased`);

    // Pagination logic
    const [deceasedRecords, total] = await this.deceasedRepository.findAndCount(
      {
        where: { status: 1 },
        order: { seqNo: 'DESC' }, // Sort by seqNo in descending order
        take: limit,
        skip: (page - 1) * limit,
      },
    );

    const paginationCount = Math.ceil(total / limit); // Total number of pages

    const deceasedDtos = deceasedRecords.map((deceased) =>
      this.mapDeceasedEntityToDto(deceased),
    );

    return {
      statusCode: 200,
      message: 'Successful',
      page: page,
      pageLimit: limit,
      paginationCount,
      deceased: deceasedDtos,
    };
  }

  // Helper method to map Deceased entity to DeceasedDto
  private mapDeceasedEntityToDto(deceased: Deceased): DeceasedDto {
    return {
      deceasedId: deceased.deceasedId,
      labelName: deceased.labelName,
      lastName: deceased.lastName,
      firstName: deceased.firstName,
      middleName: deceased.middleName,
      suffix: deceased.suffix,
      address: deceased.address,
      born: deceased.born,
      died: deceased.died,
      cemeteryLocation: deceased.cemeteryLocation,
      datePermit: deceased.datePermit,
      natureApp: deceased.natureApp,
      layerNiche: deceased.layerNiche,
      layerAddress: deceased.layerAddress,
      canvasMap: deceased.canvasMap,
      payeeLastName: deceased.payeeLastName,
      payeeFirstName: deceased.payeeFirstName,
      payeeMiddleName: deceased.payeeMiddleName,
      payeeSuffix: deceased.payeeSuffix,
      payeeContact: deceased.payeeContact,
      payeeEmail: deceased.payeeEmail,
      payeeAddress: deceased.payeeAddress,
      option1: deceased.opt1,
      option2: deceased.opt2,
      remarks: deceased.remarks,
      status: deceased.status,
    };
  }

  @ActivityLog({ action: 'Search', label: 'Profiling' })
  async searchDeceased(
    filters: Partial<DeceasedDto>,
    page: number = 1,
    limit: number = 10,
  ): Promise<DeceasedList> {
    this.logger.log(`Inside searchDeceased`);
    await this.checkIfGuest();

    // Create query builder
    const query = this.deceasedRepository.createQueryBuilder('deceased');

    // Check for filters, and apply them
    if (filters.deceasedId) {
      query.andWhere('deceased.deceasedId = :deceasedId', {
        deceasedId: filters.deceasedId,
      });
    }

    if (filters.status !== undefined) {
      query.andWhere('deceased.status = :status', { status: filters.status });
    } else {
      query.andWhere('deceased.status = :status', { status: 1 }); // Default status = 1
    }

    if (filters.lastName) {
      query.andWhere('deceased.lastName LIKE :lastName', {
        lastName: `%${filters.lastName}%`,
      });
    }

    if (filters.firstName) {
      query.andWhere('deceased.firstName LIKE :firstName', {
        firstName: `%${filters.firstName}%`,
      });
    }

    if (filters.middleName) {
      query.andWhere('deceased.middleName LIKE :middleName', {
        middleName: `%${filters.middleName}%`,
      });
    }

    if (filters.suffix) {
      query.andWhere('deceased.suffix LIKE :suffix', {
        suffix: `%${filters.suffix}%`,
      });
    }

    if (filters.address) {
      query.andWhere('deceased.address LIKE :address', {
        address: `%${filters.address}%`,
      });
    }

    if (filters.born) {
      query.andWhere('deceased.born LIKE :born', { born: `%${filters.born}%` });
    }

    if (filters.died) {
      query.andWhere('deceased.died LIKE :died', { died: `%${filters.died}%` });
    }

    if (filters.cemeteryLocation) {
      query.andWhere('deceased.cmtryLoc LIKE :cemeteryLocation', {
        cemeteryLocation: `%${filters.cemeteryLocation}%`,
      });
    }

    if (filters.datePermit) {
      query.andWhere('deceased.datePermit LIKE :datePermit', {
        datePermit: `%${filters.datePermit}%`,
      });
    }

    if (filters.natureApp) {
      query.andWhere('deceased.natureApp LIKE :natureApp', {
        natureApp: `%${filters.natureApp}%`,
      });
    }

    if (filters.layerNiche) {
      query.andWhere('deceased.layerNiche LIKE :layerNiche', {
        layerNiche: `%${filters.layerNiche}%`,
      });
    }

    if (filters.payeeLastName) {
      query.andWhere('deceased.payeeLastName LIKE :payeeLastName', {
        payeeLastName: `%${filters.payeeLastName}%`,
      });
    }

    if (filters.payeeFirstName) {
      query.andWhere('deceased.payeeFirstName LIKE :payeeFirstName', {
        payeeFirstName: `%${filters.payeeFirstName}%`,
      });
    }

    if (filters.payeeMiddleName) {
      query.andWhere('deceased.payeeMiddleName LIKE :payeeMiddleName', {
        payeeMiddleName: `%${filters.payeeMiddleName}%`,
      });
    }

    if (filters.payeeSuffix) {
      query.andWhere('deceased.payeeSuffix LIKE :payeeSuffix', {
        payeeSuffix: `%${filters.payeeSuffix}%`,
      });
    }

    if (filters.payeeContact) {
      query.andWhere('deceased.payeeContact LIKE :payeeContact', {
        payeeContact: `%${filters.payeeContact}%`,
      });
    }

    if (filters.payeeEmail) {
      query.andWhere('deceased.payeeEmail LIKE :payeeEmail', {
        payeeEmail: `%${filters.payeeEmail}%`,
      });
    }

    if (filters.payeeAddress) {
      query.andWhere('deceased.payeeAddress LIKE :payeeAddress', {
        payeeAddress: `%${filters.payeeAddress}%`,
      });
    }

    if (filters.option1) {
      query.andWhere('deceased.opt1 LIKE :option1', {
        option1: `%${filters.option1}%`,
      });
    }

    if (filters.option2) {
      query.andWhere('deceased.opt2 LIKE :option2', {
        option2: `%${filters.option2}%`,
      });
    }

    if (filters.remarks) {
      query.andWhere('deceased.remarks LIKE :remarks', {
        remarks: `%${filters.remarks}%`,
      });
    }

    // Apply sorting by seqNo in descending order and pagination
    query.orderBy('deceased.seqNo', 'DESC');
    query.take(limit).skip((page - 1) * limit);

    // Execute the query and get the results
    const [deceasedRecords, totalRecords] = await query.getManyAndCount();

    const paginationCount = Math.ceil(totalRecords / limit);

    if (deceasedRecords.length === 0) {
      return {
        statusCode: 200,
        page,
        message: 'Record not found',
        pageLimit: limit,
        paginationCount: 0,
        deceased: [],
      };
    }

    const deceasedDtos = deceasedRecords.map((deceased) =>
      this.mapDeceasedEntityToDto(deceased),
    );

    return {
      statusCode: 200,
      message: 'Successful',
      page,
      pageLimit: limit,
      paginationCount,
      deceased: deceasedDtos,
    };
  }

  @ActivityLog({ action: 'Delete', label: 'Profiling By ID' })
  async deleteDeceased(deceasedId: string): Promise<DeceasedResponse> {
    this.logger.log(`Inside deleteDeceased`);
    await this.checkIfGuest();

    // Update the status to 99 to mark it as deleted
    await this.deceasedRepository.update(
      { deceasedId },
      {
        status: 99,
        modifiedBy: this.principalUserService.userId(), // Track who performed the deletion
        modifiedDate: new Date().toISOString(), // Track when it was marked as deleted
      },
    );

    // Retrieve the updated record after marking it as deleted
    const deletedDeceased = await this.deceasedRepository.findOne({
      where: { deceasedId },
    });

    return {
      statusCode: 200,
      message: 'Deceased record marked as deleted',
      deceased: deletedDeceased || null, // Include the deceased entity in deleted state
    };
  }

  @ActivityLog({ action: 'Create', label: 'Rental Payment' })
  async addPayment(
    deceasedId: string,
    paymentDto: PaymentDto,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`Inside addPayment`);
    await this.checkIfGuest();

    const principalUserUserId = this.principalUserService.userId();
    const executionDateTime = new Date().toISOString();

    // Check if a payment with the same orderNo already exists
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderNo: paymentDto.orderNo },
    });

    if (existingPayment) {
      return {
        statusCode: 200,
        message: `Payment with order number ${paymentDto.orderNo} already exists.`,
      };
    }

    // Create the new payment with default status 1 and reason as null
    const newPayment = this.paymentRepository.create({
      ...paymentDto,
      datePaid: moment(paymentDto.datePaid).format('YYYY-MM-DD'),
      nextPaymentDate: moment(paymentDto.nextPaymentDate).format('YYYY-MM-DD'),
      addedBy: principalUserUserId,
      modifiedBy: principalUserUserId,
      addedDate: executionDateTime,
      modifiedDate: executionDateTime,
      status: 1, // Default status set to 1
      reason: null, // Default reason set to null
      deceasedId: deceasedId,
    });

    // Save the new payment
    await this.paymentRepository.save(newPayment);

    return {
      statusCode: 200,
      message: 'Payment added successfully',
      payment: paymentDto,
    };
  }

  @ActivityLog({ action: 'View', label: 'Rental Payment' })
  async getPaymentById(
    deceasedId: string,
    page: number = 1,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`Inside getPaymentById : ${deceasedId}`);
    await this.checkIfGuest();

    // Limit the number of records per page
    const limit = 10;
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    // Fetch payments by deceasedId with pagination
    const [payments, totalCount] = await this.paymentRepository.findAndCount({
      where: { deceasedId },
      take: limit,
      skip: offset,
    });

    // Map the Payment entities to PaymentDto
    const paymentDtos: PaymentDto[] = payments.map((payment) =>
      this.mapPaymentEntityToDto(payment),
    );

    // Calculate the pagination count based on total records and limit
    const paginationCount = Math.ceil(totalCount / limit);

    return {
      statusCode: 200,
      message:
        paymentDtos.length > 0
          ? 'Payments found successfully'
          : 'No payments found',
      payments: paymentDtos,
      paginationCount,
      pageLimit: limit,
    };
  }

  // Update payment by orderNo
  @ActivityLog({ action: 'Update', label: 'Rental Payment' })
  async updatePaymentByOrderNo(
    orderNo: string,
    paymentDto: PaymentDto,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`Inside updatePaymentByOrderNo`);
    await this.checkIfGuest();

    const executionDateTime = new Date().toISOString();

    const payment = await this.paymentRepository.findOne({
      where: { orderNo },
    });

    if (!payment) {
      return { statusCode: 417, message: 'Payment not found' };
    }

    Object.assign(payment, {
      ...paymentDto,
      datePaid: moment(paymentDto.datePaid).format('YYYY-MM-DD'),
      nextPaymentDate: moment(paymentDto.nextPaymentDate).format('YYYY-MM-DD'),
      modifiedBy: this.principalUserService.userId(),
      modifiedDate: executionDateTime,
    });

    await this.paymentRepository.save(payment);

    return {
      statusCode: 200,
      message: 'Payment updated successfully',
      payment: paymentDto,
    };
  }

  @ActivityLog({ action: 'Delete', label: 'Rental Payment' })
  async deletePaymentByOrderNo(
    orderNo: string,
    reason: string,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`Inside deletePaymentByOrderNo`);
    await this.checkIfGuest();

    const executionDateTime = new Date().toISOString();

    // Find the payment by orderNo
    const payment = await this.paymentRepository.findOne({
      where: { orderNo },
    });

    if (!payment) {
      return { statusCode: 417, message: 'Payment not found' };
    }

    // Ensure the reason is provided
    if (!reason || reason.trim() === '') {
      return { statusCode: 400, message: 'Reason for deletion is required' };
    }

    // Mark the payment as deleted by setting status to 99 and store the reason
    payment.status = 99;
    payment.reason = reason; // Store the reason for deletion
    payment.modifiedBy = this.principalUserService.userId(); // Set the user who deleted the payment
    payment.modifiedDate = executionDateTime; // Set the date of deletion

    // Save the updated payment record
    await this.paymentRepository.save(payment);

    return {
      statusCode: 200,
      message: 'Payment marked as deleted',
      payment: payment, // Return the updated payment record
    };
  }

  @ActivityLog({ action: 'View', label: 'Rental Payment' })
  async getPaymentByOrderNo(orderNo: string): Promise<PaymentDto> {
    this.logger.log(`Inside getPaymentByOrderNo`);
    await this.checkIfGuest();

    const payment = await this.paymentRepository.findOne({
      where: { orderNo },
    });

    if (payment) {
      return this.mapPaymentEntityToDto(payment);
    }
    return null;
  }

  @ActivityLog({ action: 'Search', label: 'Rental Payment' })
  async searchPayments(deceasedName?: string): Promise<PaymentDto[]> {
    this.logger.log(`Inside searchPayments`);
    await this.checkIfGuest();

    let payments: Payment[];

    if (deceasedName) {
      // Search for payments where deceasedName matches the query (partial match)
      payments = await this.paymentRepository.find({
        where: { deceasedName: Like(`%${deceasedName}%`) },
      });
    } else {
      // If no deceasedName is provided, return all payments
      payments = await this.paymentRepository.find();
    }

    // Map entity to DTO
    return payments.map((payment) => this.mapPaymentEntityToDto(payment));
  }

  @ActivityLog({ action: 'Update', label: 'Report Payment History' })
  async generateReport(
    year: string,
    period: string,
  ): Promise<ReportPaymentDto> {
    this.logger.log(`Inside generateReport`);
    await this.checkIfGuest();

    const query = this.paymentRepository.createQueryBuilder('payment');
    const startDate = this.getStartDateForPeriod(year, period);
    const endDate = this.getEndDateForPeriod(year, period);

    // Filter by date range
    query.where('payment.datePaid BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });

    const payments = await query.getMany();
    const recordCount = payments.length;

    // Calculate totalAmount but exclude payments with status = 99 from the sum
    const totalAmount = payments.reduce((sum, payment) => {
      return payment.status !== 99 ? sum + payment.amount : sum;
    }, 0);

    // Map payments to DTOs and set amount to 0 if status is 99
    const paymentDtos = payments.map((payment) => {
      const dto = this.mapPaymentEntityToDto(payment);
      if (payment.status === 99) {
        dto.amount = 0; // Set amount to 0 for deleted records (status 99)
      }
      return dto;
    });

    // Calculate pagination info
    const pageSize = 10; // Assume 10 records per page
    const paginationTotal = Math.ceil(recordCount / pageSize); // Total number of pages
    const currentPageRecordCount = paymentDtos.length; // Number of records in the current response

    return {
      statusCode: 200,
      message: 'Report generated successfully',
      recordCount,
      totalAmount,
      paginationTotal, // Return pagination total
      currentPageRecordCount, // Return the number of records for this page
      payments: paymentDtos, // Return payments with amount set to 0 for status 99
    };
  }

  // Utility to determine the start date for the selected period
  private getStartDateForPeriod(year: string, period: string): string {
    switch (period.toLowerCase()) {
      case 'annual':
        return `${year}-01-01`;
      case 'first quarter':
        return `${year}-01-01`;
      case 'second quarter':
        return `${year}-04-01`;
      case 'third quarter':
        return `${year}-07-01`;
      case 'fourth quarter':
        return `${year}-10-01`;
      case 'first mid year':
        return `${year}-01-01`;
      case 'final mid year':
        return `${year}-07-01`;
      default:
        // Handle specific months
        const month = moment().month(period).format('MM');
        return `${year}-${month}-01`;
    }
  }

  // Utility to determine the end date for the selected period
  private getEndDateForPeriod(year: string, period: string): string {
    switch (period.toLowerCase()) {
      case 'annual':
        return `${year}-12-31`;
      case 'first quarter':
        return `${year}-03-31`;
      case 'second quarter':
        return `${year}-06-30`;
      case 'third quarter':
        return `${year}-09-30`;
      case 'fourth quarter':
        return `${year}-12-31`;
      case 'first mid year':
        return `${year}-06-30`;
      case 'final mid year':
        return `${year}-12-31`;
      default:
        // Handle specific months
        const month = moment().month(period).format('MM');
        return moment(`${year}-${month}-01`)
          .endOf('month')
          .format('YYYY-MM-DD');
    }
  }

  @ActivityLog({ action: 'Update', label: 'Report Payment History Download' })
  async generateReportAsExcel(
    year: string,
    period: string,
  ): Promise<{ base64: string; filename: string }> {
    this.logger.log(`Inside generateReportAsExcel`);
    await this.checkIfGuest();

    const query = this.paymentRepository.createQueryBuilder('payment');
    const startDate = this.getStartDateForPeriod(year, period);
    const endDate = this.getEndDateForPeriod(year, period);

    // Filter by date range
    query.where('payment.datePaid BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });

    const payments = await query.getMany();

    // Map payments to DTOs and set amount to 0 if status is 99
    const paymentDtos = payments.map((payment) => {
      const dto = this.mapPaymentEntityToDto(payment);
      if (payment.status === 99) {
        dto.amount = 0; // Set amount to 0 for deleted records (status 99)
      }
      return dto;
    });

    // Generate Excel file
    const ws = XLSX.utils.json_to_sheet(paymentDtos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Write Excel to buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Convert buffer to base64
    const base64 = excelBuffer.toString('base64');

    return {
      base64,
      filename: `report_${year}_${period}.xlsx`,
    };
  }

  // Helper method to map Payment entity to PaymentDto
  private mapPaymentEntityToDto(payment: Payment): PaymentDto {
    return {
      deceasedName: payment.deceasedName,
      datePaid: payment.datePaid,
      kindPayment: payment.kindPayment,
      permitNo: payment.permitNo,
      orderNo: payment.orderNo,
      amount: payment.amount,
      numYearsPay: payment.numYearsPay,
      nextPaymentDate: payment.nextPaymentDate,
      status: payment.status,
      reason: payment.reason,
      addedBy: payment.addedBy,
      addedDate: payment.addedDate,
      modifiedBy: payment.modifiedBy,
      modifiedDate: payment.modifiedDate,
    };
  }

  @ActivityLog({ action: 'View', label: 'Logs' })
  async getActivityLogs(
    page: number,
    limit: number,
  ): Promise<ActivityLogResponseDto> {
    this.logger.log(`Inside getActivityLogs`);
    await this.checkIfGuest();

    const [logs, total] = await this.activityLogRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' }, // Sort by seqNo highest to lowest
    });

    const paginationCount = Math.ceil(total / limit);

    return {
      statusCode: 200,
      message: 'Success',
      paginationCount,
      pageLimit: limit,
      logs,
    };
  }

  @ActivityLog({ action: 'View', label: 'Notification' })
  async getNotificationsDueIn60Days(
    page = 1,
    limit = 10,
  ): Promise<NotificationResponseDto> {
    this.logger.log('Inside getNotificationsDueIn60Days');
    await this.checkIfGuest();

    const today = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    // Fetch payments where nextPaymentDate is within the next 60 days and join with deceased for email
    const [paymentsDue, total] = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.nextPaymentDate BETWEEN :today AND :sixtyDays', {
        today,
        sixtyDays: sixtyDaysFromNow,
      })
      .andWhere('payment.status = :status', { status: 1 })
      .innerJoin(
        Deceased,
        'deceased',
        'deceased.deceasedId = payment.deceasedId',
      )
      .select([
        'payment.deceasedId',
        'payment.deceasedName',
        'payment.amount',
        'payment.nextPaymentDate',
        'deceased.payeeEmail', // Select payeeEmail from deceased entity
      ])
      .take(limit) // Set the limit for pagination
      .skip((page - 1) * limit) // Skip records for pagination
      .getRawMany(); // Use getRawMany to fetch flat result with selected fields

    // Handle no payments found
    if (!paymentsDue || paymentsDue.length === 0) {
      return {
        statusCode: 200,
        message: 'No notifications found',
        paginationCount: 0,
        page,
        pageLimit: limit,
        deceased: [],
      };
    }

    // Map the results to the notification response
    const notifications = paymentsDue.map((payment) => ({
      deceasedName: payment.payment_deceasedName, // Access selected fields using their alias
      deceasedId: payment.payment_deceasedId,
      amount: payment.payment_amount,
      nextPaymentDate: payment.payment_nextPaymentDate,
      email: payment.deceased_payeeEmail, // Access payeeEmail from the 'deceased' table
    }));

    // Return the final notification response with pagination information
    return {
      statusCode: 200,
      message: 'Successful',
      paginationCount: Math.ceil(total / limit), // Calculate pagination count
      page,
      pageLimit: limit,
      deceased: notifications,
    };
  }
}
