import { CategoryConfigurationsService } from '../services/category-configurations.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('core/shared/category-configurations')
export class CategoryConfigurationsController {
  constructor(private readonly categoryConfigurationsService: CategoryConfigurationsService) {}

  @Get(':classificationId')
  async findByClassificationId(@Param('classificationId') classificationId: string) {
    const serviceResponse =
      await this.categoryConfigurationsService.findByClassificationId(classificationId);
    return {
      data: serviceResponse,
      message: `Configuraciones por categoria consultadas`,
      title: `Consultado`,
    };
  }
}
