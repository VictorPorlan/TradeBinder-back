import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Listing } from '../entities/listing.entity';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';
import { 
  CreateTransactionDto, 
  UpdateTransactionStatusDto, 
  TransactionResponseDto, 
  SearchTransactionsDto,
  TransactionStatus,
  CompleteTransactionDto
} from '../dto/transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto, buyerId: number): Promise<TransactionResponseDto> {
    const { listingId, quantity, paymentMethod, shippingAddress } = createTransactionDto;

    // Verificar que el listing existe y está disponible
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, isActive: true },
      relations: ['card', 'edition', 'user'],
    });

    if (!listing) {
      throw new NotFoundException('Listing no encontrado o no disponible');
    }

    // Verificar que el usuario no está comprando su propia carta
    if (listing.userId === buyerId) {
      throw new BadRequestException('No puedes comprar tu propia carta');
    }

    // Verificar que hay suficiente cantidad disponible
    if (quantity > listing.quantity) {
      throw new BadRequestException('Cantidad solicitada excede la disponible');
    }

    // Calcular precios
    const pricePerUnit = listing.price;
    const totalPrice = pricePerUnit * quantity;

    // Crear la transacción
    const transaction = this.transactionRepository.create({
      listingId,
      buyerId,
      sellerId: listing.userId,
      quantity,
      pricePerUnit,
      totalPrice,
      status: TransactionStatus.PENDING,
      paymentMethod,
      shippingAddress,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Actualizar la cantidad disponible del listing
    await this.listingRepository.update(listingId, {
      quantity: listing.quantity - quantity,
    });

    // Crear mensaje inicial para permitir acceso a la conversación
    const initialMessage = this.messageRepository.create({
      content: `Transacción creada: ${quantity} x ${listing.card?.name || 'carta'} por €${totalPrice.toFixed(2)}`,
      senderId: buyerId,
      receiverId: listing.userId,
      listingId: listingId,
      isRead: false,
    });

    await this.messageRepository.save(initialMessage);

    return this.formatTransactionResponse(savedTransaction);
  }

  async findAll(searchDto: SearchTransactionsDto, userId: number): Promise<{ data: TransactionResponseDto[], total: number, page: number, limit: number, totalPages: number }> {
    const { status, listingId, buyerId, sellerId, type, sortBy = 'createdAt', sortOrder = 'DESC', page = 1, limit = 20 } = searchDto;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.listing', 'listing')
      .leftJoinAndSelect('listing.card', 'card')
      .leftJoinAndSelect('listing.edition', 'edition')
      .leftJoinAndSelect('transaction.buyer', 'buyer')
      .leftJoinAndSelect('transaction.seller', 'seller');

    // Filtrar por tipo de transacción
    if (type === 'buyer') {
      queryBuilder.where('transaction.buyerId = :userId', { userId });
    } else if (type === 'seller') {
      queryBuilder.where('transaction.sellerId = :userId', { userId });
    } else {
      // type === 'all' o undefined
      queryBuilder.where('(transaction.buyerId = :userId OR transaction.sellerId = :userId)', { userId });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (listingId) {
      queryBuilder.andWhere('transaction.listingId = :listingId', { listingId });
    }

    if (buyerId) {
      queryBuilder.andWhere('transaction.buyerId = :buyerId', { buyerId });
    }

    if (sellerId) {
      queryBuilder.andWhere('transaction.sellerId = :sellerId', { sellerId });
    }

    // Ordenamiento
    const validSortFields = ['createdAt', 'updatedAt', 'totalPrice', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    
    queryBuilder
      .orderBy(`transaction.${sortField}`, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions.map(transaction => this.formatTransactionResponse(transaction)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number, userId: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['listing', 'listing.card', 'listing.edition', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    // Verificar que el usuario tiene acceso a esta transacción
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta transacción');
    }

    return this.formatTransactionResponse(transaction);
  }

  async updateStatus(id: number, updateDto: UpdateTransactionStatusDto, userId: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['listing', 'listing.card', 'listing.edition', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    // Solo el vendedor puede cambiar el estado
    if (transaction.sellerId !== userId) {
      throw new ForbiddenException('Solo el vendedor puede cambiar el estado de la transacción');
    }

    // Validar transiciones de estado
    this.validateStatusTransition(transaction.status, updateDto.status);

    const updatedTransaction = await this.transactionRepository.save({
      ...transaction,
      status: updateDto.status,
      trackingNumber: updateDto.trackingNumber || transaction.trackingNumber,
    });

    return this.formatTransactionResponse(updatedTransaction);
  }

  async completeTransaction(id: number, completeDto: CompleteTransactionDto, userId: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['listing', 'listing.card', 'listing.edition', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    // Solo el comprador puede completar la transacción
    if (transaction.buyerId !== userId) {
      throw new ForbiddenException('Solo el comprador puede completar la transacción');
    }

    // Permitir completar desde pending o confirmed
    if (transaction.status !== TransactionStatus.PENDING && transaction.status !== TransactionStatus.CONFIRMED) {
      throw new BadRequestException('La transacción debe estar en estado "pending" o "confirmed" para ser completada');
    }

    const updatedTransaction = await this.transactionRepository.save({
      ...transaction,
      status: TransactionStatus.DELIVERED,
      trackingNumber: completeDto.trackingNumber || transaction.trackingNumber,
    });

    return this.formatTransactionResponse(updatedTransaction);
  }

  async cancelTransaction(id: number, userId: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['listing', 'listing.card', 'listing.edition', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    // Solo el comprador o vendedor pueden cancelar
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('No tienes permisos para cancelar esta transacción');
    }

    if (transaction.status === TransactionStatus.DELIVERED) {
      throw new BadRequestException('No se puede cancelar una transacción ya entregada');
    }

    // Restaurar la cantidad del listing si está en estado pending
    if (transaction.status === TransactionStatus.PENDING) {
      await this.listingRepository.increment(
        { id: transaction.listingId },
        'quantity',
        transaction.quantity
      );
    }

    const updatedTransaction = await this.transactionRepository.save({
      ...transaction,
      status: TransactionStatus.CANCELLED,
    });

    return this.formatTransactionResponse(updatedTransaction);
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions = {
      [TransactionStatus.PENDING]: [TransactionStatus.CONFIRMED, TransactionStatus.CANCELLED, TransactionStatus.DELIVERED],
      [TransactionStatus.CONFIRMED]: [TransactionStatus.CANCELLED, TransactionStatus.DELIVERED],
      [TransactionStatus.DELIVERED]: [],
      [TransactionStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus as TransactionStatus)) {
      throw new BadRequestException(`Transición de estado inválida: ${currentStatus} -> ${newStatus}`);
    }
  }

  private formatTransactionResponse(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      listingId: transaction.listingId,
      buyerId: transaction.buyerId,
      sellerId: transaction.sellerId,
      quantity: transaction.quantity,
      pricePerUnit: transaction.pricePerUnit,
      totalPrice: transaction.totalPrice,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      shippingAddress: transaction.shippingAddress,
      trackingNumber: transaction.trackingNumber,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      listing: transaction.listing ? {
        id: transaction.listing.id,
        cardBase: {
          id: transaction.listing.card?.id || 0,
          name: transaction.listing.card?.name || 'Carta no encontrada',
          imageUrl: transaction.listing.card?.imageUrl,
        },
        edition: {
          id: transaction.listing.edition?.id || 0,
          name: transaction.listing.edition?.name || 'Edición no encontrada',
        },
        condition: transaction.listing.condition,
        price: transaction.listing.price,
      } : undefined,
      buyer: transaction.buyer ? {
        id: transaction.buyer.id,
        username: transaction.buyer.username,
        email: transaction.buyer.email,
      } : undefined,
      seller: transaction.seller ? {
        id: transaction.seller.id,
        username: transaction.seller.username,
        email: transaction.seller.email,
      } : undefined,
    };
  }
}
