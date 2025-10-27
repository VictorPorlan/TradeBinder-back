import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesService } from '../services/messages.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { CreateMessageDto } from '../dto/messages.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: Repository<Message>;
  let userRepository: Repository<User>;
  let listingRepository: Repository<Listing>;

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockListingRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    listingRepository = module.get<Repository<Listing>>(getRepositoryToken(Listing));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    const createMessageDto: CreateMessageDto = {
      content: 'Hola, ¿está disponible esta carta?',
      receiverId: 2,
      listingId: 1,
    };

    const mockListing = {
      id: 1,
      title: 'Black Lotus',
      user: { id: 3 },
    };

    const mockReceiver = {
      id: 2,
      username: 'receiver',
      email: 'receiver@example.com',
    };

    const mockMessage = {
      id: 1,
      content: 'Hola, ¿está disponible esta carta?',
      senderId: 1,
      receiverId: 2,
      listingId: 1,
      isRead: false,
      createdAt: new Date(),
      sender: { id: 1, username: 'sender', email: 'sender@example.com' },
      receiver: mockReceiver,
      listing: mockListing,
    };

    it('should create a message successfully', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);
      mockUserRepository.findOne.mockResolvedValue(mockReceiver);
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);
      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      const result = await service.createMessage(createMessageDto, 1);

      expect(result).toBeDefined();
      expect(result.content).toBe(createMessageDto.content);
      expect(result.senderId).toBe(1);
      expect(result.receiverId).toBe(2);
      expect(result.listingId).toBe(1);
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.createMessage(createMessageDto, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createMessage(createMessageDto, 1))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when sender is the same as receiver', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);
      mockUserRepository.findOne.mockResolvedValue(mockReceiver);

      await expect(service.createMessage(createMessageDto, 2))
        .rejects.toThrow(BadRequestException);
    });

    it('should allow listing owner to send messages', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);
      mockUserRepository.findOne.mockResolvedValue(mockReceiver);
      mockMessageRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      });
      mockTransactionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      });
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);
      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      const result = await service.createMessage(createMessageDto, 3); // 3 is the listing owner

      expect(result).toBeDefined();
      expect(mockMessageRepository.save).toHaveBeenCalled();
    });
  });

  describe('getConversations', () => {
    it('should return conversations for a user', async () => {
      const mockMessages = [
        {
          id: 1,
          content: 'Hola',
          senderId: 1,
          receiverId: 2,
          listingId: 1,
          isRead: false,
          createdAt: new Date(),
          sender: { id: 1, username: 'sender', email: 'sender@example.com' },
          receiver: { id: 2, username: 'receiver', email: 'receiver@example.com' },
          listing: {
            id: 1,
            title: 'Black Lotus',
            price: 100,
            card: { name: 'Black Lotus', imageUrl: 'test.jpg' },
          },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMessages),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getConversations(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMessagesByListing', () => {
    it('should return messages for a listing', async () => {
      const mockMessages = [
        {
          id: 1,
          content: 'Hola',
          senderId: 1,
          receiverId: 2,
          listingId: 1,
          isRead: false,
          createdAt: new Date(),
          sender: { id: 1, username: 'sender', email: 'sender@example.com' },
          receiver: { id: 2, username: 'receiver', email: 'receiver@example.com' },
          listing: { id: 1, title: 'Black Lotus', price: 100 },
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.getMessagesByListing(1, 1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getMessagesByListing(1, 1))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      const mockMessage = {
        id: 1,
        content: 'Hola',
        senderId: 1,
        receiverId: 2,
        listingId: 1,
        isRead: false,
        createdAt: new Date(),
        sender: { id: 1, username: 'sender', email: 'sender@example.com' },
        receiver: { id: 2, username: 'receiver', email: 'receiver@example.com' },
        listing: { id: 1, title: 'Black Lotus', price: 100 },
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue({ ...mockMessage, isRead: true });

      const result = await service.markAsRead(1, 2);

      expect(result).toBeDefined();
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException when message does not exist', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(1, 2))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the receiver', async () => {
      const mockMessage = {
        id: 1,
        content: 'Hola',
        senderId: 1,
        receiverId: 2,
        listingId: 1,
        isRead: false,
        createdAt: new Date(),
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      await expect(service.markAsRead(1, 1))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockMessageRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(1);

      expect(result).toBe(5);
    });
  });
});

