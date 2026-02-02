import { Auth, User } from '@auth/decorators';
import { UserEntity } from '@auth/entities';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseHttpInterface } from '@utils/interfaces';
import { ProcessFoodDrinkService } from '../services/process-food-drink.service';
import { CreateRegistrationProcessFoodDrinkDto } from '@modules/core/roles/external/dto/process-food-drink';

@ApiTags('Process Food Drink')
@Auth()
@Controller('core/external/process-food-drinks')
export class ProcessFoodDrinkController {
  constructor(private service: ProcessFoodDrinkService) {}
  // ruta para registrar actividad de alimentos y bebidas
  @ApiOperation({ summary: 'Registrar actividad de alimentos y bebidas' })
  @Post('registrations')
  async createRegistration(
    @Body() payload: CreateRegistrationProcessFoodDrinkDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    console.log('Payload recibido:', payload);
    const serviceResponse = await this.service.createRegistration(payload, user);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }
}
