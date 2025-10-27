import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddLocationSystem1700000000000 implements MigrationInterface {
  name = 'AddLocationSystem1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla locations
    await queryRunner.createTable(
      new Table({
        name: 'locations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices para locations
    await queryRunner.createIndex(
      'locations',
      new TableIndex({
        name: 'IDX_LOCATIONS_NAME',
        columnNames: ['name'],
        isUnique: true,
      }),
    );

    // Insertar Mallorca como ubicación inicial
    await queryRunner.query(`
      INSERT INTO locations (name, description, isActive) 
      VALUES ('Mallorca', 'Isla de Mallorca, España', true)
    `);

    // Agregar columna locationId a users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'locationId',
        type: 'int',
        isNullable: true, // Temporalmente nullable
      }),
    );

    // Actualizar usuarios existentes con Mallorca (ID 1)
    await queryRunner.query(`
      UPDATE users 
      SET "locationId" = 1 
      WHERE "locationId" IS NULL
    `);

    // Hacer la columna NOT NULL después de actualizar los datos
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN "locationId" SET NOT NULL
    `);

    // Crear índice para locationId en users
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_LOCATION_ID',
        columnNames: ['locationId'],
      }),
    );

    // Crear foreign key para users.locationId -> locations.id
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['locationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'locations',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Agregar columna locationId a listings
    await queryRunner.addColumn(
      'listings',
      new TableColumn({
        name: 'locationId',
        type: 'int',
        isNullable: true, // Temporalmente nullable
      }),
    );

    // Actualizar listings existentes con Mallorca (ID 1)
    await queryRunner.query(`
      UPDATE listings 
      SET "locationId" = 1 
      WHERE "locationId" IS NULL
    `);

    // Hacer la columna NOT NULL después de actualizar los datos
    await queryRunner.query(`
      ALTER TABLE listings 
      ALTER COLUMN "locationId" SET NOT NULL
    `);

    // Crear índice para locationId en listings
    await queryRunner.createIndex(
      'listings',
      new TableIndex({
        name: 'IDX_LISTINGS_LOCATION_ID',
        columnNames: ['locationId'],
      }),
    );

    // Crear foreign key para listings.locationId -> locations.id
    await queryRunner.createForeignKey(
      'listings',
      new TableForeignKey({
        columnNames: ['locationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'locations',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // Eliminar columna location de users (texto libre)
    await queryRunner.dropColumn('users', 'location');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurar columna location en users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'location',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Eliminar foreign keys
    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const usersLocationForeignKey = usersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('locationId') !== -1,
      );
      if (usersLocationForeignKey) {
        await queryRunner.dropForeignKey('users', usersLocationForeignKey);
      }
    }

    const listingsTable = await queryRunner.getTable('listings');
    if (listingsTable) {
      const listingsLocationForeignKey = listingsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('locationId') !== -1,
      );
      if (listingsLocationForeignKey) {
        await queryRunner.dropForeignKey('listings', listingsLocationForeignKey);
      }
    }

    // Eliminar índices
    await queryRunner.dropIndex('users', 'IDX_USERS_LOCATION_ID');
    await queryRunner.dropIndex('listings', 'IDX_LISTINGS_LOCATION_ID');

    // Eliminar columnas locationId
    await queryRunner.dropColumn('users', 'locationId');
    await queryRunner.dropColumn('listings', 'locationId');

    // Eliminar tabla locations
    await queryRunner.dropTable('locations');
  }
}
