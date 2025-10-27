import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Card } from '../entities/card-base.entity';
import { SearchCardsDto, CardResponseDto, PaginatedCardsResponseDto } from '../dto/cards.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async findAll(searchDto: SearchCardsDto): Promise<PaginatedCardsResponseDto> {
    const {
      name,
      manaCost,
      type,
      subtype,
      rarity,
      artist,
      text,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = searchDto;

    const queryBuilder = this.cardRepository.createQueryBuilder('card');

    // Aplicar filtros
    if (name) {
      queryBuilder.andWhere('card.name ILIKE :name', { name: `%${name}%` });
    }

    if (manaCost) {
      queryBuilder.andWhere('card.manaCost ILIKE :manaCost', { manaCost: `%${manaCost}%` });
    }

    if (type) {
      queryBuilder.andWhere('card.type ILIKE :type', { type: `%${type}%` });
    }

    if (subtype) {
      queryBuilder.andWhere('card.subtype ILIKE :subtype', { subtype: `%${subtype}%` });
    }

    if (rarity) {
      queryBuilder.andWhere('card.rarity ILIKE :rarity', { rarity: `%${rarity}%` });
    }

    if (artist) {
      queryBuilder.andWhere('card.artist ILIKE :artist', { artist: `%${artist}%` });
    }

    if (text) {
      queryBuilder.andWhere('card.text ILIKE :text', { text: `%${text}%` });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('card.isActive = :isActive', { isActive });
    }

    // Aplicar ordenamiento
    queryBuilder.orderBy(`card.${sortBy}`, sortOrder);

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ejecutar consulta
    const [cards, total] = await queryBuilder.getManyAndCount();

    // Convertir a DTOs
    const cardDtos: CardResponseDto[] = cards.map(card => ({
      id: card.id,
      name: card.name,
      manaCost: card.manaCost,
      type: card.type,
      subtype: card.subtype,
      rarity: card.rarity,
      text: card.text,
      flavorText: card.flavorText,
      power: card.power,
      toughness: card.toughness,
      loyalty: card.loyalty,
      imageUrl: card.imageUrl,
      artist: card.artist,
      number: card.number,
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));

    return {
      data: cardDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<CardResponseDto> {
    const card = await this.cardRepository.findOne({
      where: { id, isActive: true },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return {
      id: card.id,
      name: card.name,
      manaCost: card.manaCost,
      type: card.type,
      subtype: card.subtype,
      rarity: card.rarity,
      text: card.text,
      flavorText: card.flavorText,
      power: card.power,
      toughness: card.toughness,
      loyalty: card.loyalty,
      imageUrl: card.imageUrl,
      artist: card.artist,
      number: card.number,
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  async searchCards(searchTerm: string, limit: number = 10): Promise<CardResponseDto[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const cards = await this.cardRepository.find({
      where: [
        { name: ILike(`%${searchTerm}%`), isActive: true },
        { text: ILike(`%${searchTerm}%`), isActive: true },
        { type: ILike(`%${searchTerm}%`), isActive: true },
      ],
      take: limit,
      order: { name: 'ASC' },
    });

    return cards.map(card => ({
      id: card.id,
      name: card.name,
      manaCost: card.manaCost,
      type: card.type,
      subtype: card.subtype,
      rarity: card.rarity,
      text: card.text,
      flavorText: card.flavorText,
      power: card.power,
      toughness: card.toughness,
      loyalty: card.loyalty,
      imageUrl: card.imageUrl,
      artist: card.artist,
      number: card.number,
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  }

  async getCardStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active] = await Promise.all([
      this.cardRepository.count(),
      this.cardRepository.count({ where: { isActive: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
