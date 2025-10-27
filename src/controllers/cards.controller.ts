import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from '../services/cards.service';
import { SearchCardsDto, CardResponseDto, PaginatedCardsResponseDto } from '../dto/cards.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async findAll(@Query() searchDto: SearchCardsDto): Promise<PaginatedCardsResponseDto> {
    return this.cardsService.findAll(searchDto);
  }

  @Get('search')
  async searchCards(
    @Query('q') searchTerm: string,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<CardResponseDto[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    return this.cardsService.searchCards(searchTerm.trim(), limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CardResponseDto> {
    return this.cardsService.findOne(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getCardStats(): Promise<{ total: number; active: number; inactive: number }> {
    return this.cardsService.getCardStats();
  }
}
