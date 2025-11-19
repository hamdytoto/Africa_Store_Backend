import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString ,IsDefined } from 'class-validator';

export function IsRequiredString() {
  return applyDecorators(
    IsDefined(),
    IsNotEmpty(),
    IsString(),
  );
}
