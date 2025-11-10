import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddUserIdToPriceOverrides1762746500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before adding
    const table = await queryRunner.getTable('price_overrides');
    const userIdColumn = table?.findColumnByName('user_id');

    if (!userIdColumn) {
      // Add user_id column
      await queryRunner.addColumn(
        'price_overrides',
        new TableColumn({
          name: 'user_id',
          type: 'integer',
          isNullable: true,
          comment: 'User-specific price override. NULL = global override, non-NULL = user-specific override',
        }),
      );

      // Add index on user_id for query performance
      await queryRunner.createIndex(
        'price_overrides',
        new TableIndex({
          name: 'IDX_price_overrides_user_id',
          columnNames: ['user_id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex('price_overrides', 'IDX_price_overrides_user_id');

    // Drop column
    await queryRunner.dropColumn('price_overrides', 'user_id');
  }
}

