import { DataSource } from 'typeorm';
import { Edition } from '../../entities/edition.entity';

export async function seedEditions(dataSource: DataSource): Promise<void> {
  const editionRepository = dataSource.getRepository(Edition);

  // Check if editions already exist
  const existingEditions = await editionRepository.count();
  if (existingEditions > 0) {
    console.log('Editions already seeded, skipping...');
    return;
  }

  const editions = [
    {
      name: 'Alpha',
      releaseDate: new Date('1993-08-05'),
      hasFoil: false,
    },
    {
      name: 'Beta',
      releaseDate: new Date('1993-10-04'),
      hasFoil: false,
    },
    {
      name: 'Unlimited',
      releaseDate: new Date('1993-12-01'),
      hasFoil: false,
    }
  ];

  for (const editionData of editions) {
    const edition = editionRepository.create(editionData);
    await editionRepository.save(edition);
  }

  console.log(`Seeded ${editions.length} editions`);
}
