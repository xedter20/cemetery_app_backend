import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActyLog } from '../model/activity-log.entity';
import { PrincipalUserService } from '../config/security/principal-user.service';

@Injectable()
export class ActivityService {

  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(ActyLog)
    private readonly activityLogRepository: Repository<ActyLog>,
    private readonly principalUserService: PrincipalUserService,  
  ) {}

  async logActivity(action: string, label?: string): Promise<void> {
    this.logger.log(`Inside logActivity`);
    
    const email = this.principalUserService.email();
    
    if (!email) {
      return;
    }
  
    const userId = email.split('@')[0]; 
    const accountType = this.principalUserService.accountType();
  
    const newActivityLog = this.activityLogRepository.create({
      userId,
      action,
      label: label || 'Unknown',
      accountType,
      createdDate: new Date().toISOString(),
    });
  
    try {
      await this.activityLogRepository.save(newActivityLog);
      console.log('Activity log saved successfully');
    } catch (error) {
      console.error('Error saving activity log:', error);
    }
  }
  
}
