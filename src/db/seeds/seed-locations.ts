import { DataSource } from 'typeorm';

export async function seedLocations(dataSource: DataSource): Promise<void> {
  const locationRepository = dataSource.getRepository('Location');

  const locations = [
    {
      name: 'Mallorca',
      description: 'Isla de Mallorca, España',
      isActive: true,
    },
    // Futuras ubicaciones se pueden agregar aquí
    // {
    //   name: 'Menorca',
    //   description: 'Isla de Menorca, España',
    //   isActive: true,
    // },
    // {
    //   name: 'Ibiza',
    //   description: 'Isla de Ibiza, España',
    //   isActive: true,
    // },
  ];

  for (const locationData of locations) {
    const existingLocation = await locationRepository.findOne({
      where: { name: locationData.name },
    });

    if (!existingLocation) {
      const location = locationRepository.create(locationData);
      await locationRepository.save(location);
      console.log(`✅ Location "${locationData.name}" created`);
    } else {
      console.log(`⚠️  Location "${locationData.name}" already exists`);
    }
  }
}
