import {
  Controller,
  Post,
  Patch,
  Param,
  Query,
  Get,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggingInterceptor } from '../config/logger/core-logging.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { HasLoggedInAuthority } from '../decorators/has-logged-in-authority.decorator';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './dto/token-response.dto';
import { DeceasedDto } from './dto/deceased.dto';
import { DeceasedResponse } from './dto/deceased-response.dto';
import { PaymentDto } from './dto/payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ReportPaymentDto } from './dto/report-payment.dto';
import { AdminService } from '../service/admin.service';
import { ActyLog } from '../model/activity-log.entity';
import { DeceasedList } from './dto/deceased-list.dto';
import { User } from 'src/model/user.entity';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { AccountType } from 'src/enums/account-type.enum';
import { UserList } from './dto/user-list.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('Admin') // Groups all these endpoints under the 'Admin' tag in Swagger
@Controller('admin')
@UseInterceptors(LoggingInterceptor)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('test')
  @ApiOperation({ summary: 'Test API endpoint' })
  @ApiResponse({ status: 200, description: 'Returns Hello world.' })
  async test(): Promise<string> {
    return 'Hello world';
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Returns a token response.',
    type: TokenResponse,
  })
  async login(@Body() loginData: LoginDto): Promise<TokenResponse> {
    return this.adminService.login(loginData);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get permissions for the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Returns permissions for the user.',
  })
  @HasLoggedInAuthority()
  async getPermissions() {
    return this.adminService.getPermissions();
  }

  @HasLoggedInAuthority()
  @Get('/user')
  @ApiOperation({
    summary:
      'Search users across all account types (treasurer, enterprise, guest)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of users per page',
    example: 10,
  })
  async searchUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<UserList> {
    const accountTypes = [
      AccountType.Treasurer,
      AccountType.Enterprise,
      AccountType.Guest,
    ];
    return this.adminService.getUsersByAccountType(accountTypes, page, limit);
  }

  @HasLoggedInAuthority()
  @Get('/treasurer')
  @ApiOperation({ summary: 'Get partial list of treasurers' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  async getPartialTreasurers(
    @Query('page') page: number,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getUsersByAccountType(
      AccountType.Treasurer,
      page,
      limit,
    );
  }

  @HasLoggedInAuthority()
  @Get('/treasurer/:id')
  @ApiOperation({ summary: 'Get treasurer by ID' })
  @ApiParam({ name: 'id', description: 'ID of the treasurer' })
  async getTreasurerById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @HasLoggedInAuthority()
  @Patch('/treasurer/:id')
  @ApiOperation({ summary: 'Update treasurer by ID' })
  async updateTreasurerById(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.adminService.updateUserById(id, updateData);
  }

  @HasLoggedInAuthority()
  @Patch('/treasurer/:id/delete')
  @ApiOperation({ summary: 'Delete treasurer by ID' })
  async deleteTreasurerById(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.deleteUserById(id, reason);
  }

  // Enterprise Endpoints (Similar to treasurer endpoints)

  @HasLoggedInAuthority()
  @Get('/enterprise')
  @ApiOperation({ summary: 'Get partial list of enterprises' })
  async getPartialEnterprises(
    @Query('page') page: number,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getUsersByAccountType(
      AccountType.Enterprise,
      page,
      limit,
    );
  }

  @HasLoggedInAuthority()
  @Get('/enterprise/:id')
  @ApiOperation({ summary: 'Get enterprise by ID' })
  async getEnterpriseById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @HasLoggedInAuthority()
  @Patch('/enterprise/:id')
  @ApiOperation({ summary: 'Update enterprise by ID' })
  async updateEnterpriseById(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.adminService.updateUserById(id, updateData);
  }

  @HasLoggedInAuthority()
  @Patch('/enterprise/:id/delete')
  @ApiOperation({ summary: 'Delete enterprise by ID' })
  async deleteEnterpriseById(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.deleteUserById(id, reason);
  }

  // Guest Endpoints (Similar to treasurer and enterprise endpoints)

  @HasLoggedInAuthority()
  @Get('/guest')
  @ApiOperation({ summary: 'Get partial list of guests' })
  async getPartialGuests(@Query('page') page: number) {
    return this.adminService.getUsersByAccountType(AccountType.Guest, page);
  }

  @HasLoggedInAuthority()
  @Get('/guest/:id')
  @ApiOperation({ summary: 'Get guest by ID' })
  async getGuestById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @HasLoggedInAuthority()
  @Patch('/guest/:id')
  @ApiOperation({ summary: 'Update guest by ID' })
  async updateGuestById(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.adminService.updateUserById(id, updateData);
  }

  @HasLoggedInAuthority()
  @Patch('/guest/:id/delete')
  @ApiOperation({ summary: 'Delete guest by ID' })
  async deleteGuestById(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.deleteUserById(id, reason);
  }

  // Profiling Endpoints (Similar to treasurer and enterprise endpoints)
  @Post('deceased')
  @ApiOperation({ summary: 'Create a deceased profile' })
  @ApiResponse({
    status: 200,
    description: 'Deceased profile created successfully.',
    type: DeceasedResponse,
  })
  @HasLoggedInAuthority()
  async createDeceased(
    @Body() deceasedDto: DeceasedDto,
  ): Promise<DeceasedResponse> {
    return this.adminService.createDeceased(deceasedDto);
  }

  @Get('/deceased/:deceasedId')
  @ApiOperation({ summary: 'Get a deceased profile' })
  @ApiParam({ name: 'deceasedId', description: 'ID of the deceased profile' })
  @ApiResponse({
    status: 200,
    description: 'Deceased profile updated successfully.',
    type: DeceasedResponse,
  })
  @HasLoggedInAuthority()
  async getDeceasedByDeceasedId(
    @Param('deceasedId') deceasedId: string,
  ): Promise<DeceasedResponse> {
    return this.adminService.getDeceasedByDeceasedId(deceasedId);
  }

  @Patch('/deceased/:deceasedId')
  @ApiOperation({ summary: 'Update a deceased profile' })
  @ApiParam({ name: 'deceasedId', description: 'ID of the deceased profile' })
  @ApiResponse({
    status: 200,
    description: 'Deceased profile updated successfully.',
    type: DeceasedResponse,
  })
  @HasLoggedInAuthority()
  async updateDeceased(
    @Param('deceasedId') deceasedId: string,
    @Body() deceasedDto: DeceasedDto,
  ): Promise<DeceasedResponse> {
    return this.adminService.updateDeceased(deceasedId, deceasedDto);
  }

  @HasLoggedInAuthority()
  @Patch('/deceased/:deceasedId/delete')
  @ApiOperation({ summary: 'Mark a deceased profile as deleted' })
  @ApiParam({ name: 'deceasedId', description: 'ID of the deceased profile' })
  @ApiResponse({
    status: 200,
    description: 'Deceased profile marked as deleted.',
    type: DeceasedResponse,
  })
  async deleteDeceased(
    @Param('deceasedId') deceasedId: string,
  ): Promise<DeceasedResponse> {
    return this.adminService.deleteDeceased(deceasedId);
  }

  @Get('/deceased')
  @ApiOperation({ summary: 'Search deceased profiles with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of profiles per page',
    example: 10,
  })
  @ApiQuery({
    name: 'filters',
    description: 'Search filters for deceased profiles',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching deceased profiles.',
    type: [DeceasedList],
  })
  @HasLoggedInAuthority()
  async searchDeceased(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Partial<DeceasedDto>,
  ): Promise<DeceasedList> {
    return this.adminService.searchDeceased(filters, page, limit);
  }

  @Post('/payment/:deceasedId')
  @ApiOperation({ summary: 'Add a new rental payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment added successfully.',
    type: PaymentResponseDto,
  })
  @HasLoggedInAuthority()
  async addPayment(
    @Param('deceasedId') deceasedId: string,
    @Body() paymentDto: PaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.adminService.addPayment(deceasedId, paymentDto);
  }

  @Get('/payment/:deceasedId')
  @ApiOperation({ summary: 'Add a new rental payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment added successfully.',
    type: PaymentResponseDto,
  })
  @HasLoggedInAuthority()
  async getPaymentById(
    @Param('deceasedId') deceasedId: string,
  ): Promise<PaymentResponseDto> {
    return this.adminService.getPaymentById(deceasedId);
  }

  @Get('/payment')
  @ApiOperation({ summary: 'Get all payment' })
  @ApiQuery({
    name: 'deceasedName',
    description: 'Optional filter by deceased name',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns payment based on search criteria.',
    type: [PaymentDto],
  })
  @HasLoggedInAuthority()
  async getAllPayments(
    @Query('deceasedName') deceasedName?: string,
  ): Promise<PaymentDto[]> {
    return this.adminService.searchPayments(deceasedName);
  }

  @Get('/payment/:deceasedId/:orderNo')
  @ApiOperation({ summary: 'Get a payment by order number' })
  @ApiParam({ name: 'orderNo', description: 'Order number of the payment' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment details for the given order number.',
    type: PaymentDto,
  })
  @HasLoggedInAuthority()
  async getPaymentByOrderNo(
    @Param('orderNo') orderNo: string,
  ): Promise<PaymentDto> {
    return this.adminService.getPaymentByOrderNo(orderNo);
  }

  @Patch('/payment/:deceasedId/:orderNo')
  @ApiOperation({ summary: 'Update a payment by order number' })
  @ApiParam({ name: 'orderNo', description: 'Order number of the payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully.',
    type: PaymentResponseDto,
  })
  @HasLoggedInAuthority()
  async updatePaymentByOrderNo(
    @Param('orderNo') orderNo: string,
    @Body() paymentDto: PaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.adminService.updatePaymentByOrderNo(orderNo, paymentDto);
  }

  @Patch('/payment/:deceasedId/:orderNo/delete')
  @ApiOperation({ summary: 'Mark a payment as deleted by order number' })
  @ApiParam({ name: 'orderNo', description: 'Order number of the payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as deleted.',
    type: PaymentResponseDto,
  })
  @HasLoggedInAuthority()
  async deletePayment(
    @Param('orderNo') orderNo: string,
    @Body('reason') reason: string,
  ): Promise<PaymentResponseDto> {
    return this.adminService.deletePaymentByOrderNo(orderNo, reason);
  }

  @Get('/report')
  @ApiOperation({ summary: 'Generate a payment history report' })
  @ApiQuery({
    name: 'year',
    description: 'Year for the report',
    required: false,
  })
  @ApiQuery({
    name: 'period',
    description: 'Period for the report',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully.',
    type: ReportPaymentDto,
  })
  @HasLoggedInAuthority()
  async getReport(
    @Query('year') year?: string,
    @Query('period') period?: string,
  ): Promise<ReportPaymentDto> {
    const currentYear = new Date().getFullYear().toString();
    const defaultPeriod = new Date().toLocaleString('default', {
      month: 'long',
    });

    return this.adminService.generateReport(
      year || currentYear,
      period || defaultPeriod,
    );
  }

  @Get('/report/download')
  @ApiOperation({ summary: 'Download a payment history report as Excel' })
  @ApiQuery({
    name: 'year',
    description: 'Year for the report',
    required: false,
  })
  @ApiQuery({
    name: 'period',
    description: 'Period for the report',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Report downloaded successfully.',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  @HasLoggedInAuthority()
  async downloadReport(
    @Query('year') year?: string,
    @Query('period') period?: string,
  ): Promise<{ base64: string; filename: string }> {
    const currentYear = new Date().getFullYear().toString();
    const defaultPeriod = new Date().toLocaleString('default', {
      month: 'long',
    });

    return this.adminService.generateReportAsExcel(
      year || currentYear,
      period || defaultPeriod,
    );
  }

  @Get('/notifications')
  @ApiOperation({ summary: 'Get list of notifications with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of notifications per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns notifications.',
    type: NotificationResponseDto,
  })
  @HasLoggedInAuthority()
  async getNotifications(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<NotificationResponseDto> {
    return this.adminService.getNotificationsDueIn60Days(page, limit);
  }

  @Get('/logs')
  @ApiOperation({ summary: 'Get all activity logs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns activity logs.',
    type: ActivityLogResponseDto,
  })
  @HasLoggedInAuthority()
  @HasLoggedInAuthority()
  async getActivityLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ActivityLogResponseDto> {
    return this.adminService.getActivityLogs(page, limit);
  }
}
