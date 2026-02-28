import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

/** POST /v1/auth/signup – inherits all validations from CreateUserDto */
export class RegisterDto extends OmitType(CreateUserDto, [] as const) {}
