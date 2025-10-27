import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from '../controllers/listings.controller';
import { ListingsService } from '../services/listings.service';
import { 
  CreateListingDto, 
  UpdateListingDto, 
  UpdateListingStatusDto,
  ListingResponseDto, 
  PaginatedListingsResponseDto,
  ListingStatus
} from '../dto/listings.dto';

describe('ListingsController', () => {
  let controller: ListingsController;
  let service: ListingsService;

  const mockListingResponse: ListingResponseDto = {
    id: 1,
    userId: 1,
    cardId: 1,
    editionId: 1,
    condition: 'near_mint',
    isFoil: false,
    price: 150.00,
    quantity: 1,
    description: 'Lightning Bolt Alpha en excelente estado',
    images: ['https://example.com/listing1.jpg'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      username: 'testuser',
      location: 'Madrid, España',
    },
    card: {
      id: 1,
      name: 'Lightning Bolt',
      manaCost: '{R}',
      type: 'Instant',
      rarity: 'Common',
      imageUrl: 'https://example.com/lightning-bolt.jpg',
    },
    edition: {
      id: 1,
      name: 'Alpha',
      releaseDate: new Date('1993-08-05'),
      hasFoil: false,
    },
  };

  const mockPaginatedResponse: PaginatedListingsResponseDto = {
    data: [mockListingResponse],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  const mockStats = {
    total: 100,
    active: 80,
    inactive: 20,
    totalValue: 10000.00,
  };

  const mockListingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    findByUser: jest.fn(),
    getListingStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        {
          provide: ListingsService,
          useValue: mockListingsService,
        },
      ],
    }).compile();

    controller = module.get<ListingsController>(ListingsController);
    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a listing', async () => {
      const createListingDto: CreateListingDto = {
        cardId: 1,
        editionId: 1,
        condition: 'near_mint',
        isFoil: false,
        price: 150.00,
        quantity: 1,
        description: 'Lightning Bolt Alpha en excelente estado',
      };

      mockListingsService.create.mockResolvedValue(mockListingResponse);

      const result = await controller.create(1, createListingDto);

      expect(result).toEqual(mockListingResponse);
      expect(service.create).toHaveBeenCalledWith(1, createListingDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const searchDto = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      mockListingsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(searchDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('findMyListings', () => {
    it('should return user listings', async () => {
      mockListingsService.findByUser.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findMyListings(1, 1, 20);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findByUser).toHaveBeenCalledWith(1, 1, 20);
    });
  });

  describe('getStats', () => {
    it('should return listing statistics', async () => {
      mockListingsService.getListingStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getListingStats).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a listing by id', async () => {
      mockListingsService.findOne.mockResolvedValue(mockListingResponse);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockListingResponse);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a listing', async () => {
      const updateListingDto: UpdateListingDto = {
        price: 200.00,
        description: 'Updated description',
      };

      mockListingsService.update.mockResolvedValue({
        ...mockListingResponse,
        ...updateListingDto,
      });

      const result = await controller.update(1, 1, updateListingDto);

      expect(result.price).toBe(200.00);
      expect(service.update).toHaveBeenCalledWith(1, 1, updateListingDto);
    });
  });

  describe('updateStatus', () => {
    it('should update listing status', async () => {
      const updateStatusDto: UpdateListingStatusDto = {
        status: ListingStatus.SOLD,
      };

      mockListingsService.updateStatus.mockResolvedValue({
        ...mockListingResponse,
        isActive: false,
      });

      const result = await controller.updateStatus(1, 1, updateStatusDto);

      expect(result.isActive).toBe(false);
      expect(service.updateStatus).toHaveBeenCalledWith(1, 1, updateStatusDto);
    });
  });

  describe('remove', () => {
    it('should remove a listing', async () => {
      mockListingsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, 1);

      expect(result).toEqual({ message: 'Listing deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});
