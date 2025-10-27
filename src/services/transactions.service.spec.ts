import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from '../services/transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { Listing } from '../entities/listing.entity';
import { User } from '../entities/user.entity';
import { CreateTransactionDto, TransactionStatus } from '../dto/transactions.dto';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let listingRepository: Repository<Listing>;
  let userRepository: Repository<User>;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    increment: jest.fn(),
  };

  const mockListingRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    listingRepository = module.get<Repository<Listing>>(getRepositoryToken(Listing));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    const createTransactionDto: CreateTransactionDto = {
      listingId: 1,
      quantity: 2,
      paymentMethod: 'paypal',
      shippingAddress: '123 Main St',
    };

    const mockListing = {
      id: 1,
      userId: 2,
      quantity: 5,
      price: 10.50,
      isActive: true,
      cardBase: { id: 1, name: 'Lightning Bolt', imageUrl: 'test.jpg' },
      edition: { id: 1, name: 'Alpha' },
      user: { id: 2, username: 'seller', email: 'seller@test.com' },
    };

    const mockTransaction = {
      id: 1,
      listingId: 1,
      buyerId: 1,
      sellerId: 2,
      quantity: 2,
      pricePerUnit: 10.50,
      totalPrice: 21.00,
      status: TransactionStatus.PENDING,
      paymentMethod: 'paypal',
      shippingAddress: '123 Main St',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a transaction successfully', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockListingRepository.update.mockResolvedValue({});

      const result = await service.createTransaction(createTransactionDto, 1);

      expect(mockListingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        relations: ['cardBase', 'edition', 'user'],
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        listingId: 1,
        buyerId: 1,
        sellerId: 2,
        quantity: 2,
        pricePerUnit: 10.50,
        totalPrice: 21.00,
        status: TransactionStatus.PENDING,
        paymentMethod: 'paypal',
        shippingAddress: '123 Main St',
      });
      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(mockListingRepository.update).toHaveBeenCalledWith(1, {
        quantity: 3, // 5 - 2
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when listing is not found', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.createTransaction(createTransactionDto, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user tries to buy their own listing', async () => {
      mockListingRepository.findOne.mockResolvedValue({
        ...mockListing,
        userId: 1, // Same as buyerId
      });

      await expect(service.createTransaction(createTransactionDto, 1))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when quantity exceeds available', async () => {
      mockListingRepository.findOne.mockResolvedValue({
        ...mockListing,
        quantity: 1, // Less than requested quantity (2)
      });

      await expect(service.createTransaction(createTransactionDto, 1))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    const mockTransaction = {
      id: 1,
      buyerId: 1,
      sellerId: 2,
      listing: { id: 1 },
      buyer: { id: 1, username: 'buyer', email: 'buyer@test.com' },
      seller: { id: 2, username: 'seller', email: 'seller@test.com' },
    };

    it('should return transaction when user is buyer', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(1, 1);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['listing', 'listing.cardBase', 'listing.edition', 'buyer', 'seller'],
      });
      expect(result.id).toBe(1);
    });

    it('should return transaction when user is seller', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(1, 2);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when transaction is not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(service.findOne(1, 3)) // Different user
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    const mockTransaction = {
      id: 1,
      sellerId: 2,
      status: TransactionStatus.PENDING,
      listing: { id: 1 },
      buyer: { id: 1, username: 'buyer', email: 'buyer@test.com' },
      seller: { id: 2, username: 'seller', email: 'seller@test.com' },
    };

    it('should update status when user is seller', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.CONFIRMED,
      });

      const result = await service.updateStatus(1, {
        status: TransactionStatus.CONFIRMED,
      }, 2);

      expect(result.status).toBe(TransactionStatus.CONFIRMED);
    });

    it('should throw ForbiddenException when user is not seller', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(service.updateStatus(1, {
        status: TransactionStatus.CONFIRMED,
      }, 1)) // Buyer trying to update status
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelTransaction', () => {
    const mockTransaction = {
      id: 1,
      buyerId: 1,
      sellerId: 2,
      status: TransactionStatus.PENDING,
      quantity: 2,
      listingId: 1,
      listing: { id: 1 },
      buyer: { id: 1, username: 'buyer', email: 'buyer@test.com' },
      seller: { id: 2, username: 'seller', email: 'seller@test.com' },
    };

    it('should cancel transaction when user is buyer', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.CANCELLED,
      });
      mockListingRepository.increment.mockResolvedValue({});

      const result = await service.cancelTransaction(1, 1);

      expect(result.status).toBe(TransactionStatus.CANCELLED);
      expect(mockListingRepository.increment).toHaveBeenCalledWith(
        { id: 1 },
        'quantity',
        2
      );
    });

    it('should throw BadRequestException when trying to cancel delivered transaction', async () => {
      mockTransactionRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.DELIVERED,
      });

      await expect(service.cancelTransaction(1, 1))
        .rejects.toThrow(BadRequestException);
    });
  });
});
