import { DataSource } from 'typeorm';
import { Card } from '../../entities/card-base.entity';

export async function seedCards(dataSource: DataSource): Promise<void> {
  const cardRepository = dataSource.getRepository(Card);

  // Verificar si ya existen cartas
  const existingCards = await cardRepository.count();
  if (existingCards > 0) {
    console.log('Cards already seeded, skipping...');
    return;
  }

  const sampleCards: Partial<Card>[] = [
    {
      name: 'Lightning Bolt',
      manaCost: '{R}',
      type: 'Instant',
      rarity: 'Common',
      text: 'Lightning Bolt deals 3 damage to any target.',
      imageUrl: 'https://cards.scryfall.io/large/front/d/5/d573ef03-4730-45aa-93dd-e45ac1dbaf4a.jpg?1559591645',
      artist: 'Christopher Rush',
      number: '161',
      isActive: true,
    },
    {
      name: 'Black Lotus',
      manaCost: '{0}',
      type: 'Artifact',
      rarity: 'Rare',
      text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
      imageUrl: 'https://cards.scryfall.io/large/front/b/0/b0faa7f2-b547-42c4-a810-839da50dadfe.jpg?1559591477',
      artist: 'Christopher Rush',
      number: '232',
      isActive: true,
    },
    {
      name: 'Counterspell',
      manaCost: '{U}{U}',
      type: 'Instant',
      rarity: 'Common',
      text: 'Counter target spell.',
      imageUrl: 'https://cards.scryfall.io/large/front/0/d/0df55e3f-14de-46ef-b6b1-616618724d9e.jpg?1559591713',
      artist: 'Mark Poole',
      number: '61',
      isActive: true,
    },
    {
      name: 'Serra Angel',
      manaCost: '{3}{W}{W}',
      type: 'Creature — Angel',
      subtype: 'Angel',
      rarity: 'Uncommon',
      text: 'Flying, vigilance',
      power: '4',
      toughness: '4',
      imageUrl: 'https://cards.scryfall.io/large/front/f/8/f8ac5006-91bd-4803-93da-f87cf196dd2f.jpg?1559591394',
      artist: 'Douglas Shuler',
      number: '25',
      isActive: true,
    },
    {
      name: 'Shivan Dragon',
      manaCost: '{4}{R}{R}',
      type: 'Creature — Dragon',
      subtype: 'Dragon',
      rarity: 'Rare',
      text: 'Flying\n{R}: Shivan Dragon gets +1/+0 until end of turn.',
      power: '5',
      toughness: '5',
      imageUrl: 'https://cards.scryfall.io/large/front/f/e/fefbf149-f988-4f8b-9f53-56f5878116a6.jpg?1559591401',
      artist: 'Melissa A. Benson',
      number: '143',
      isActive: true,
    },
    
  ];

  // Insertar cartas
  for (const cardData of sampleCards) {
    const card = cardRepository.create(cardData);
    await cardRepository.save(card);
  }

  console.log(`Seeded ${sampleCards.length} cards`);
}
