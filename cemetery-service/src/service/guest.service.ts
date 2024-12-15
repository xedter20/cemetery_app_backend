import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

//dev
import { Permission } from '../model/permission.entity';
import { Deceased } from '../model/deceased.entity';
import { DeceasedResponse } from '../controller/dto/deceased-response.dto';
import { ActivityLog } from '../decorators/activity-log.decorator';
import { LoginDto } from '../controller/dto/login.dto';
import { TokenResponse } from '../controller/dto/token-response.dto';
import { User } from '../model/user.entity';
import { ActivityService } from '../service/activity.service';
import { PrincipalUserService } from '../config/security/principal-user.service';

@Injectable()
export class GuestService {
  private readonly logger = new Logger(GuestService.name);

  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly activityService: ActivityService,
    private readonly principalUserService: PrincipalUserService,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  @ActivityLog({ action: 'Login', label: 'Login Guest' })
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
        'Auth service offline or unavailables',
      );
    }
  }

  async getPermissions() {
    this.logger.log(`Inside getPermission guest`);
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

  @ActivityLog({ action: 'Search', label: 'Niche Information' })
  async searchByFullname(fullname: string): Promise<DeceasedResponse> {
    this.logger.log(`Inside searchByFullname`);

    // console.log({ fullname });

    // Query the deceased by full name, converting both column values and the search term to uppercase
    const deceased = await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where(
        `TRIM(UPPER(COALESCE(deceased.firstName, ''))) || ' ' || 
    TRIM(UPPER(COALESCE(deceased.middleName, ''))) || ' ' || 
    TRIM(UPPER(COALESCE(deceased.lastName, ''))) LIKE UPPER(:fullname)`,
        { fullname: `%${fullname}%` }, // Wrap the fullname with wildcards for LIKE matching
      )
      .andWhere('deceased.status = :status', { status: 1 }) // Only search for status 1
      .getOne();

    if (!deceased) {
      return {
        statusCode: 417,
        message: 'The niche name not found',
        deceased: null,
      };
    }

    return {
      statusCode: 200,
      message: 'Deceased found successfully',
      deceased,
    };
  }
  @ActivityLog({ action: 'Search', label: 'Niche Information' })
  async searchAllDeceased(fullname: string): Promise<DeceasedResponse> {
    this.logger.log(`Inside searchByFullname`);

    console.log('Dex');
    console.log({ fullname });

    // Query the deceased by full name
    const deceased = await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where(
        `TRIM(LOWER(COALESCE(deceased.firstName, ''))) || ' ' || 
       TRIM(LOWER(COALESCE(deceased.middleName, ''))) || ' ' || 
       TRIM(LOWER(COALESCE(deceased.lastName, ''))) LIKE LOWER(:fullname)`,
        { fullname: `%${fullname}%` }, // Wrap the fullname with wildcards for LIKE matching
      )
      .andWhere('deceased.status = :status', { status: 1 }) // Only search for status 1
      .getMany();

    if (deceased.length === 0) {
      return {
        statusCode: 417,
        message: 'The niche name not found',
        deceasedList: [], // return empty array if no records are found
      };
    }

    return {
      statusCode: 200,
      message: 'Deceased found successfully',
      deceasedList: deceased, // return the list of deceased records
    };
  }
}
