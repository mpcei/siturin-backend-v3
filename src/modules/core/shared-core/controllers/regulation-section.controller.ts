import { Controller, Get, Param } from '@nestjs/common';
import { RegulationSectionService } from '../services/regulation-section.service';
import { PublicRoute } from '@auth/decorators';

@Controller('core/shared/regulations')
export class RegulationSectionController {
  constructor(private readonly regulationSectionService: RegulationSectionService) {}

  @PublicRoute()
  @Get('sections/:modelId')
  async findSectionsByModelId(@Param('modelId') modelId: string) {
    const sections = await this.regulationSectionService.findSectionsByModelId(modelId);

    return { data: sections };
  }

  @Get('sections/:modelId/adventure')
  async findAdventureSectionsByModelId(@Param('modelId') modelId: string) {
    const sections = await this.regulationSectionService.findAdventureSectionsByModelId(modelId);
    return { data: sections };
  }

  @Get()
  findAll() {
    return this.regulationSectionService.findAll();
  }
}
