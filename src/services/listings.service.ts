import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Listing, User, Card, Edition, Location } from '../entities';
import { 
  CreateListingDto, 
  UpdateListingDto, 
  UpdateListingStatusDto,
  SearchListingsDto, 
  ListingResponseDto, 
  PaginatedListingsResponseDto,
  ListingCondition,
  ListingStatus
} from '../dto/listings.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Edition)
    private readonly editionRepository: Repository<Edition>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(userId: number, createListingDto: CreateListingDto): Promise<ListingResponseDto> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar que la carta existe
    const card = await this.cardRepository.findOne({ where: { id: createListingDto.cardId } });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    // Verificar que la edición existe
    const edition = await this.editionRepository.findOne({ where: { id: createListingDto.editionId } });
    if (!edition) {
      throw new NotFoundException('Edition not found');
    }

    // Verificar que la ubicación existe
    const location = await this.locationRepository.findOne({ 
      where: { id: createListingDto.locationId, isActive: true } 
    });
    if (!location) {
      throw new NotFoundException('Location not found or inactive');
    }

    // Crear el listing
    const listing = this.listingRepository.create({
      ...createListingDto,
      userId,
    });

    const savedListing = await this.listingRepository.save(listing);

    return this.formatListingResponse(savedListing);
  }

  async findAll(searchDto: SearchListingsDto, userLocationId?: number): Promise<PaginatedListingsResponseDto> {
    const {
      cardName,
      cardId,
      editionId,
      locationId,
      condition,
      isFoil,
      minPrice,
      maxPrice,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('user.location', 'userLocation')
      .leftJoinAndSelect('listing.card', 'card')
      .leftJoinAndSelect('listing.edition', 'edition')
      .leftJoinAndSelect('listing.location', 'location');

    // Filtrar por ubicación del usuario si no se especifica otra ubicación
    if (userLocationId && !locationId) {
      queryBuilder.andWhere('listing.locationId = :userLocationId', { userLocationId });
    } else if (locationId) {
      queryBuilder.andWhere('listing.locationId = :locationId', { locationId });
    }

    // Aplicar filtros
    if (cardName) {
      queryBuilder.andWhere('card.name ILIKE :cardName', { cardName: `%${cardName}%` });
    }

    if (cardId) {
      queryBuilder.andWhere('listing.cardId = :cardId', { cardId });
    }

    if (editionId) {
      queryBuilder.andWhere('listing.editionId = :editionId', { editionId });
    }

    if (condition) {
      queryBuilder.andWhere('listing.condition = :condition', { condition });
    }

    if (isFoil !== undefined) {
      queryBuilder.andWhere('listing.isFoil = :isFoil', { isFoil });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('listing.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('listing.price <= :maxPrice', { maxPrice });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('listing.isActive = :isActive', { isActive });
    }

    // Excluir listings que tienen transacciones activas (no canceladas)
    queryBuilder.andWhere((qb) => {
      const subQuery = qb.subQuery()
        .select('1')
        .from('transactions', 't')
        .where('t.listingId = listing.id')
        .andWhere('t.status != :cancelledStatus', { cancelledStatus: 'cancelled' })
        .getQuery();
      return `NOT EXISTS (${subQuery})`;
    });

    // Aplicar ordenamiento
    queryBuilder.orderBy(`listing.${sortBy}`, sortOrder);

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ejecutar consulta
    const [listings, total] = await queryBuilder.getManyAndCount();

    // Convertir a DTOs
    const listingDtos: ListingResponseDto[] = listings.map(listing => this.formatListingResponse(listing));

    return {
      data: listingDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ListingResponseDto> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['user', 'user.location', 'card', 'edition', 'location'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return this.formatListingResponse(listing);
  }

  async update(userId: number, id: number, updateListingDto: UpdateListingDto): Promise<ListingResponseDto> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['user', 'user.location', 'card', 'edition', 'location'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    // Verificar que el usuario es el propietario
    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Actualizar el listing
    Object.assign(listing, updateListingDto);
    const updatedListing = await this.listingRepository.save(listing);

    return this.formatListingResponse(updatedListing);
  }

  async remove(userId: number, id: number): Promise<void> {
    const listing = await this.listingRepository.findOne({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    // Verificar que el usuario es el propietario
    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.listingRepository.remove(listing);
  }

  async updateStatus(userId: number, id: number, updateStatusDto: UpdateListingStatusDto): Promise<ListingResponseDto> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['user', 'user.location', 'card', 'edition', 'location'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    // Verificar que el usuario es el propietario
    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Mapear el status a isActive
    switch (updateStatusDto.status) {
      case ListingStatus.AVAILABLE:
        listing.isActive = true;
        break;
      case ListingStatus.SOLD:
      case ListingStatus.CANCELLED:
        listing.isActive = false;
        break;
      default:
        throw new BadRequestException('Invalid status');
    }

    const updatedListing = await this.listingRepository.save(listing);

    return this.formatListingResponse(updatedListing);
  }

  async findByUser(userId: number, page: number = 1, limit: number = 20): Promise<PaginatedListingsResponseDto> {
    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('user.location', 'userLocation')
      .leftJoinAndSelect('listing.card', 'card')
      .leftJoinAndSelect('listing.edition', 'edition')
      .leftJoinAndSelect('listing.location', 'location')
      .where('listing.userId = :userId', { userId })
      .andWhere((qb) => {
        const subQuery = qb.subQuery()
          .select('1')
          .from('transactions', 't')
          .where('t.listingId = listing.id')
          .andWhere('t.status != :cancelledStatus', { cancelledStatus: 'cancelled' })
          .getQuery();
        return `NOT EXISTS (${subQuery})`;
      })
      .orderBy('listing.createdAt', 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [listings, total] = await queryBuilder.getManyAndCount();

    const listingDtos: ListingResponseDto[] = listings.map(listing => this.formatListingResponse(listing));

    return {
      data: listingDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getListingStats(): Promise<{ total: number; active: number; inactive: number; totalValue: number }> {
    const [total, active, inactive] = await Promise.all([
      this.listingRepository.count(),
      this.listingRepository.count({ where: { isActive: true } }),
      this.listingRepository.count({ where: { isActive: false } }),
    ]);

    const totalValueResult = await this.listingRepository
      .createQueryBuilder('listing')
      .select('SUM(listing.price * listing.quantity)', 'totalValue')
      .where('listing.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalValue = parseFloat(totalValueResult?.totalValue || '0');

    return {
      total,
      active,
      inactive,
      totalValue,
    };
  }

  private formatListingResponse(listing: Listing): ListingResponseDto {
    return {
      id: listing.id,
      userId: listing.userId,
      cardId: listing.cardId,
      editionId: listing.editionId,
      locationId: listing.locationId,
      condition: listing.condition as ListingCondition,
      isFoil: listing.isFoil,
      price: listing.price,
      quantity: listing.quantity,
      description: listing.description,
      images: listing.images,
      isActive: listing.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      user: listing.user ? {
        id: listing.user.id,
        username: listing.user.username,
        location: listing.user.location ? {
          id: listing.user.location.id,
          name: listing.user.location.name,
        } : undefined,
      } : undefined,
      cardBase: listing.card ? {
        id: listing.card.id,
        name: listing.card.name,
        manaCost: listing.card.manaCost,
        type: listing.card.type,
        rarity: listing.card.rarity,
        imageUrl: listing.card.imageUrl,
      } : undefined,
      edition: listing.edition ? {
        id: listing.edition.id,
        name: listing.edition.name,
        releaseDate: listing.edition.releaseDate,
        hasFoil: listing.edition.hasFoil,
      } : undefined,
      location: listing.location ? {
        id: listing.location.id,
        name: listing.location.name,
      } : undefined,
    };
  }
}
