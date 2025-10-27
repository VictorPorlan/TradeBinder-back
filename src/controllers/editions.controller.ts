import { Controller, Get } from '@nestjs/common';
import { EditionsService } from '../services/editions.service';
import { EditionResponseDto } from '../dto/editions.dto';

@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get()
  async findAll(): Promise<EditionResponseDto[]> {
    try {
      return await this.editionsService.findAll();
    } catch (error) {
      console.error('Error in editions controller:', error);
      throw error;
    }
  }
}
