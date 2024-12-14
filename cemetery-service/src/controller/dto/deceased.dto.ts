import { IsString, IsOptional, IsDate, IsNumber, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeceasedDto {

  @ApiProperty({ description: 'Unique ID of the deceased', example: 'd12345' })
  @IsString()
  @Length(1, 80)
  deceasedId: string;

  @ApiProperty({ description: 'Label name', example: 'Mr. John Doe' })
  @IsString()
  @Length(1, 80)
  labelName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @Length(1, 80)
  lastName: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @Length(1, 80)
  firstName: string;

  @ApiProperty({ description: 'Middle name', example: 'A.' })
  @IsString()
  @Length(1, 80)
  middleName: string;

  @ApiProperty({ description: 'Suffix (e.g., Jr, Sr)', example: 'Jr' })
  @IsString()
  @Length(1, 80)
  suffix: string;

  @ApiProperty({ description: 'Address', example: '123 Main St, Anytown' })
  @IsString()
  @Length(1, 80)
  address: string;

  @ApiProperty({ description: 'Date of birth', example: '1970-01-01' })
  @IsDate()
  born: string;

  @ApiProperty({ description: 'Date of death', example: '2022-01-01' })
  @IsDate()
  died: string;

  @ApiProperty({ description: 'Cemetery location', example: 'Plot A, Row 3' })
  @IsString()
  @Length(1, 80)
  cemeteryLocation: string;

  @ApiProperty({ description: 'Permit date', example: '2022-01-15' })
  @IsDate()
  datePermit: string;

  @ApiProperty({ description: 'Nature of application', example: 'Burial permit' })
  @IsString()
  @Length(1, 80)
  natureApp: string;

  @ApiProperty({ description: 'Layer or niche', example: 'Niche 12' })
  @IsString()
  @Length(1, 80)
  layerNiche: string;

  @ApiProperty({ description: 'Layer or niche', example: 'B1P2' })
  @IsString()
  @Length(1, 80)
  layerAddress: string;

  @ApiProperty({ description: 'Payee last name', example: 'Doe' })
  @IsString()
  @Length(1, 80)
  payeeLastName: string;

  @ApiProperty({ description: 'Payee first name', example: 'John' })
  @IsString()
  @Length(1, 80)
  payeeFirstName: string;

  @ApiProperty({ description: 'Payee middle name', example: 'A.' })
  @IsString()
  @Length(1, 80)
  payeeMiddleName: string;

  @ApiProperty({ description: 'Payee suffix', example: 'Jr' })
  @IsString()
  @Length(1, 80)
  payeeSuffix: string;

  @ApiProperty({ description: 'Payee contact', example: '123-456-7890' })
  @IsString()
  @Length(1, 80)
  payeeContact: string;

  @ApiProperty({ description: 'Payee email', example: 'johndoe@example.com' })
  @IsString()
  @Length(1, 80)
  payeeEmail: string;

  @ApiProperty({ description: 'Payee address', example: '456 Second St, Anytown' })
  @IsString()
  @Length(1, 80)
  payeeAddress: string;

  @ApiProperty({ description: 'Option 1', example: 'Option 1 details' })
  @IsString()
  @Length(1, 80)
  option1: string;

  @ApiProperty({ description: 'Option 2', example: 'Option 2 details' })
  @IsString()
  @Length(1, 80)
  option2: string;

  @ApiProperty({ description: 'Remarks', example: 'Some remarks' })
  @IsString()
  @Length(1, 80)
  remarks: string;

  @ApiProperty({ description: 'Status of the deceased record', example: 1 })
  @IsNumber()
  status: number;

  @ApiProperty({ description: 'Canvas map (optional, base64 string up to 4000 characters)', example: 'base64encodedstring...', maxLength: 4000 })
  @IsOptional()
  @IsString()
  @Length(0, 4000)
  canvasMap: string;  // This field can be up to 4000 characters.
}
