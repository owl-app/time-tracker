import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { registerUserValidationSchema } from '@owl-app/lib-contracts';

import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { Public } from '@owl-app/lib-api-core/metadata/route';
import { ApiErrorValidationResponse } from '@owl-app/lib-api-core/api/api-error-validation.response';

import { RegistrationCommand } from './registration.service';
import { RegistrationRequest } from './dto/registration.request';

@Controller('')
@ApiTags('User')
@ApiResponse({ status: 500, description: 'Internal error' })
export class RegistrationController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ description: 'registration' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegistrationRequest })
  @Public()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully register.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @Post('/registration')
  async login(
    @Body(new ValibotValidationPipe(registerUserValidationSchema))
    registration: RegistrationRequest
  ): Promise<void> {
    await this.commandBus.execute(new RegistrationCommand(registration));
  }
}
