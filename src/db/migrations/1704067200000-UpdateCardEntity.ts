import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCardEntity1704067200000 implements MigrationInterface {
  name = 'UpdateCardEntity1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar nuevas columnas a la tabla cards
    await queryRunner.addColumn('cards', new TableColumn({
      name: 'manaCost',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'type',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'subtype',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'rarity',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'text',
      type: 'text',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'flavorText',
      type: 'text',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'power',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'toughness',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'loyalty',
      type: 'integer',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'artist',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'number',
      type: 'varchar',
      isNullable: true,
    }));

    await queryRunner.addColumn('cards', new TableColumn({
      name: 'isActive',
      type: 'boolean',
      default: true,
    }));

    // Crear índices para mejorar el rendimiento de las consultas
    await queryRunner.query('CREATE INDEX "IDX_cards_manaCost" ON "cards" ("manaCost")');
    await queryRunner.query('CREATE INDEX "IDX_cards_type" ON "cards" ("type")');
    await queryRunner.query('CREATE INDEX "IDX_cards_rarity" ON "cards" ("rarity")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query('DROP INDEX "IDX_cards_rarity"');
    await queryRunner.query('DROP INDEX "IDX_cards_type"');
    await queryRunner.query('DROP INDEX "IDX_cards_manaCost"');

    // Eliminar columnas
    await queryRunner.dropColumn('cards', 'isActive');
    await queryRunner.dropColumn('cards', 'number');
    await queryRunner.dropColumn('cards', 'artist');
    await queryRunner.dropColumn('cards', 'loyalty');
    await queryRunner.dropColumn('cards', 'toughness');
    await queryRunner.dropColumn('cards', 'power');
    await queryRunner.dropColumn('cards', 'flavorText');
    await queryRunner.dropColumn('cards', 'text');
    await queryRunner.dropColumn('cards', 'rarity');
    await queryRunner.dropColumn('cards', 'subtype');
    await queryRunner.dropColumn('cards', 'type');
    await queryRunner.dropColumn('cards', 'manaCost');
  }
}
