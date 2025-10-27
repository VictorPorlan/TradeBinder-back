import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from '../controllers/cards.controller';
import { CardsService } from '../services/cards.service';
import { CardResponseDto, PaginatedCardsResponseDto } from '../dto/cards.dto';

describe('CardsController', () => {
  let controller: CardsController;
  let service: CardsService;

  const mockCardResponse: CardResponseDto = {
    id: 1,
    name: 'Lightning Bolt',
    manaCost: '{R}',
    type: 'Instant',
    subtype: null,
    rarity: 'Common',
    text: 'Lightning Bolt deals 3 damage to any target.',
    flavorText: null,
    power: null,
    toughness: null,
    loyalty: null,
    imageUrl: 'https://example.com/lightning-bolt.jpg',
    artist: 'Christopher Rush',
    number: '161',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedCardsResponseDto = {
    data: [mockCardResponse],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  const mockCardsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    searchCards: jest.fn(),
    getCardStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cards', async () => {
      mockCardsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('searchCards', () => {
    it('should return search results', async () => {
      mockCardsService.searchCards.mockResolvedValue([mockCardResponse]);

      const result = await controller.searchCards('Lightning', 10);

      expect(result).toEqual([mockCardResponse]);
      expect(service.searchCards).toHaveBeenCalledWith('Lightning', 10);
    });

    it('should return empty array for empty search term', async () => {
      const result = await controller.searchCards('', 10);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      mockCardsService.findOne.mockResolvedValue(mockCardResponse);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockCardResponse);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getCardStats', () => {
    it('should return card statistics', async () => {
      const mockStats = { total: 100, active: 95, inactive: 5 };
      mockCardsService.getCardStats.mockResolvedValue(mockStats);

      const result = await controller.getCardStats();

      expect(result).toEqual(mockStats);
      expect(service.getCardStats).toHaveBeenCalled();
    });
  });
});
