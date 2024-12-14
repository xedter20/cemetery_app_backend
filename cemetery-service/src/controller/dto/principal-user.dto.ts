import { ApiProperty } from '@nestjs/swagger';

export class PrincipalUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  accountType: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  device: string;

  @ApiProperty()
  location: string;
  
    // Instance method to map the decoded token to this PrincipalUser instance
    mapFromToken(decodedToken: any): PrincipalUser {
      console.log('Inside mapFromToken'); 

      this.id = decodedToken.id;
      this.firstname = decodedToken.firstname;
      this.lastname = decodedToken.lastname;
      this.email = decodedToken.email;
      this.userId = decodedToken.userId;
      this.role = decodedToken.role;
      this.accountType = decodedToken.accountType;
      this.sessionId = decodedToken.sessionId;
      this.device = decodedToken.device;
      this.location = decodedToken.location;

      console.log('Final PrincipalUser object:', JSON.stringify(this, null, 2)); // Pretty print the final PrincipalUser object
      return this;
    }
  }