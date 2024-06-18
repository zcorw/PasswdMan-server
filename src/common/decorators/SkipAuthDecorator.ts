import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from '../constants/decorators';
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
