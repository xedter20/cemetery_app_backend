import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { AccountType } from '../enums/account-type.enum';

@Injectable()
export class ValidateAccountTypePipe implements PipeTransform {
  transform(value: any) {
    const validAccountTypes = Object.values(AccountType);

    if (!validAccountTypes.includes(value)) {
      throw new BadRequestException('Invalid Account Type');
    }

    return value;  
  }
}