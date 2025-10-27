import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { Transaction } from '../entities/transaction.entity';
import { CreateMessageDto, UpdateMessageDto, MessageResponseDto, ConversationResponseDto, MarkAsReadDto } from '../dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, senderId: number): Promise<MessageResponseDto> {
    const { content, receiverId, listingId } = createMessageDto;

    // Verificar que el listing existe
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['user'],
    });

    if (!listing) {
      throw new NotFoundException('Listing no encontrado');
    }

    // Verificar que el receptor existe
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Usuario receptor no encontrado');
    }

    // Verificar que el sender no es el mismo que el receiver
    if (senderId === receiverId) {
      throw new BadRequestException('No puedes enviarte mensajes a ti mismo');
    }

    // Verificar que el usuario tiene acceso a esta conversación
    // Opción 1: Ha enviado o recibido mensajes anteriormente
    const hasMessageAccess = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.listingId = :listingId', { listingId })
      .andWhere('(message.senderId = :senderId OR message.receiverId = :senderId)', { senderId })
      .getCount() > 0;

    // Opción 2: Tiene transacciones activas en este listing
    const hasTransactionAccess = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.listingId = :listingId', { listingId })
      .andWhere('(transaction.buyerId = :senderId OR transaction.sellerId = :senderId)', { senderId })
      .andWhere('transaction.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'shipped'] })
      .getCount() > 0;

    // Opción 3: Es el propietario del listing
    const isListingOwner = senderId === listing.user.id;

    if (!hasMessageAccess && !hasTransactionAccess && !isListingOwner) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    // Crear el mensaje
    const message = this.messageRepository.create({
      content,
      senderId,
      receiverId,
      listingId,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Cargar relaciones para la respuesta
    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'receiver', 'listing'],
    });

    if (!messageWithRelations) {
      throw new NotFoundException('Mensaje no encontrado después de crear');
    }

    return this.mapToResponseDto(messageWithRelations);
  }

  async getConversations(userId: number): Promise<ConversationResponseDto[]> {
    // Obtener todas las conversaciones donde el usuario es sender o receiver
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.listing', 'listing')
      .leftJoinAndSelect('listing.card', 'card')
      .leftJoinAndSelect('listing.user', 'listingUser')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // Agrupar por listingId
    const conversationMap = new Map<number, ConversationResponseDto>();

    for (const message of conversations) {
      const listingId = message.listingId;
      
      if (!conversationMap.has(listingId)) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        
        conversationMap.set(listingId, {
          listingId,
          listing: {
            id: message.listing.id,
            title: message.listing.card?.name || 'Carta sin nombre',
            price: message.listing.price,
            card: {
              name: message.listing.card.name,
              imageUrl: message.listing.card.imageUrl,
            },
          },
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            email: otherUser.email,
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            senderId: message.senderId,
          },
          unreadCount: 0,
          totalMessages: 0,
        });
      }

      const conversation = conversationMap.get(listingId);
      
      if (!conversation) {
        continue; // Skip si no existe la conversación
      }
      
      // Actualizar último mensaje si es más reciente
      if (conversation.lastMessage && new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          senderId: message.senderId,
        };
      }

      // Contar mensajes no leídos (solo los que el usuario recibió)
      if (message.receiverId === userId && !message.isRead) {
        conversation.unreadCount++;
      }

      conversation.totalMessages++;
    }

    // Convertir Map a Array y ordenar por último mensaje
    return Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }

  async getMessagesByListing(listingId: number, userId: number): Promise<MessageResponseDto[]> {
    console.log(`[DEBUG] Checking access for user ${userId} to listing ${listingId}`);
    
    // Verificar que el usuario tiene acceso a esta conversación
    // Opción 1: Ha enviado o recibido mensajes
    const hasMessageAccess = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.listingId = :listingId', { listingId })
      .andWhere('(message.senderId = :userId OR message.receiverId = :userId)', { userId })
      .getCount() > 0;

    console.log(`[DEBUG] Has message access: ${hasMessageAccess}`);

    // Opción 2: Tiene transacciones activas en este listing
    const hasTransactionAccess = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.listingId = :listingId', { listingId })
      .andWhere('(transaction.buyerId = :userId OR transaction.sellerId = :userId)', { userId })
      .andWhere('transaction.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'shipped'] })
      .getCount() > 0;

    console.log(`[DEBUG] Has transaction access: ${hasTransactionAccess}`);

    // Opción 3: Es el propietario del listing
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      select: ['userId']
    });
    const isListingOwner = listing && listing.userId === userId;

    console.log(`[DEBUG] Is listing owner: ${isListingOwner} (listing owner: ${listing?.userId})`);

    if (!hasMessageAccess && !hasTransactionAccess && !isListingOwner) {
      console.log(`[DEBUG] Access denied for user ${userId} to listing ${listingId}`);
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    console.log(`[DEBUG] Access granted for user ${userId} to listing ${listingId}`);

    const messages = await this.messageRepository.find({
      where: { listingId },
      relations: ['sender', 'receiver', 'listing'],
      order: { createdAt: 'ASC' },
    });

    return messages.map(message => this.mapToResponseDto(message));
  }

  async markAsRead(messageId: number, userId: number): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver', 'listing'],
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Verificar que el usuario es el receptor del mensaje
    if (message.receiverId !== userId) {
      throw new ForbiddenException('Solo puedes marcar como leído tus propios mensajes recibidos');
    }

    message.isRead = true;
    const updatedMessage = await this.messageRepository.save(message);

    return this.mapToResponseDto(updatedMessage);
  }

  async markAllAsRead(listingId: number, userId: number): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('listingId = :listingId', { listingId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('isRead = false')
      .execute();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  private mapToResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      listingId: message.listingId,
      sender: message.sender ? {
        id: message.sender.id,
        username: message.sender.username,
        email: message.sender.email,
      } : undefined,
      receiver: message.receiver ? {
        id: message.receiver.id,
        username: message.receiver.username,
        email: message.receiver.email,
      } : undefined,
      listing: message.listing ? {
        id: message.listing.id,
        title: message.listing.card?.name || 'Carta sin nombre',
        price: message.listing.price,
      } : undefined,
    };
  }
}

