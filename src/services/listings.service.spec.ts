import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListingsService } from '../services/listings.service';
import { Listing, User, Card, Edition } from '../entities';
import { CreateListingDto, UpdateListingDto, UpdateListingStatusDto, ListingStatus } from '../dto/listings.dto';

describe('ListingsService', () => {
  let service: ListingsService;
  let listingRepository: Repository<Listing>;
  let userRepository: Repository<User>;
  let cardRepository: Repository<Card>;
  let editionRepository: Repository<Edition>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    location: 'Madrid, España',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    listings: [],
    transactions: [],
    reviews: [],
    favorites: [],
  };

  const mockCard: Card = {
    id: 1,
    name: 'Lightning Bolt',
    manaCost: '{R}',
    type: 'Instant',
    rarity: 'Common',
    text: 'Lightning Bolt deals 3 damage to any target.',
    imageUrl: 'https://example.com/lightning-bolt.jpg',
    artist: 'Christopher Rush',
    number: '161',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    listings: [],
  };

  const mockEdition: Edition = {
    id: 1,
    name: 'Alpha',
    releaseDate: new Date('1993-08-05'),
    hasFoil: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    listings: [],
  };

  const mockListing: Listing = {
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
    user: mockUser,
    card: mockCard,
    edition: mockEdition,
    transactions: [],
    messages: [],
    favorites: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
      getRawOne: jest.fn().mockResolvedValue({ totalValue: '1000.00' }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Edition),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    listingRepository = module.get<Repository<Listing>>(getRepositoryToken(Listing));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    editionRepository = module.get<Repository<Edition>>(getRepositoryToken(Edition));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a listing successfully', async () => {
      const createListingDto: CreateListingDto = {
        cardId: 1,
        editionId: 1,
        condition: 'near_mint',
        isFoil: false,
        price: 150.00,
        quantity: 1,
        description: 'Lightning Bolt Alpha en excelente estado',
        images: ['https://example.com/listing1.jpg'],
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // user exists
        .mockResolvedValueOnce(mockCard) // card exists
        .mockResolvedValueOnce(mockEdition); // edition exists

      mockRepository.create.mockReturnValue(mockListing);
      mockRepository.save.mockResolvedValue(mockListing);

      const result = await service.create(1, createListingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.price).toBe(150.00);
    });

    it('should throw NotFoundException when user not found', async () => {
      const createListingDto: CreateListingDto = {
        cardId: 1,
        editionId: 1,
        condition: 'near_mint',
        isFoil: false,
        price: 150.00,
        quantity: 1,
      };

      mockRepository.findOne.mockResolvedValue(null); // user not found

      await expect(service.create(999, createListingDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when card not found', async () => {
      const createListingDto: CreateListingDto = {
        cardId: 999,
        editionId: 1,
        condition: 'near_mint',
        isFoil: false,
        price: 150.00,
        quantity: 1,
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // user exists
        .mockResolvedValueOnce(null); // card not found

      await expect(service.create(1, createListingDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a listing by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockListing);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when listing not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a listing successfully', async () => {
      const updateListingDto: UpdateListingDto = {
        price: 200.00,
        description: 'Updated description',
      };

      mockRepository.findOne.mockResolvedValue(mockListing);
      mockRepository.save.mockResolvedValue({ ...mockListing, ...updateListingDto });

      const result = await service.update(1, 1, updateListingDto);

      expect(result).toBeDefined();
      expect(result.price).toBe(200.00);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const updateListingDto: UpdateListingDto = {
        price: 200.00,
      };

      mockRepository.findOne.mockResolvedValue(mockListing);

      await expect(service.update(2, 1, updateListingDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a listing successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockListing);
      mockRepository.remove.mockResolvedValue(mockListing);

      await service.remove(1, 1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockListing);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockListing);

      await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update status to sold successfully', async () => {
      const updateStatusDto: UpdateListingStatusDto = {
        status: ListingStatus.SOLD,
      };

      mockRepository.findOne.mockResolvedValue(mockListing);
      mockRepository.save.mockResolvedValue({ ...mockListing, isActive: false });

      const result = await service.updateStatus(1, 1, updateStatusDto);

      expect(result).toBeDefined();
      expect(result.isActive).toBe(false);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const updateStatusDto: UpdateListingStatusDto = {
        status: 'invalid_status' as ListingStatus,
      };

      mockRepository.findOne.mockResolvedValue(mockListing);

      await expect(service.updateStatus(1, 1, updateStatusDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getListingStats', () => {
    it('should return listing statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // active
        .mockResolvedValueOnce(20); // inactive

      const result = await service.getListingStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        inactive: 20,
        totalValue: 1000.00,
      });
    });
  });
});
