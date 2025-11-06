import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddStaticProxyFields1730903400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加新字段到 static_proxies 表
    await queryRunner.addColumns('static_proxies', [
      new TableColumn({
        name: 'order_no',
        type: 'varchar',
        length: '255',
        isNullable: true,
        comment: '985Proxy订单号',
      }),
      new TableColumn({
        name: 'expire_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'IP到期时间',
      }),
      new TableColumn({
        name: 'plan',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: "'shared'",
        comment: 'IP套餐类型: shared/premium',
      }),
      new TableColumn({
        name: 'last_synced_at',
        type: 'timestamp',
        isNullable: true,
        comment: '最后同步时间',
      }),
    ]);

    // 添加索引以提升查询性能
    await queryRunner.createIndex(
      'static_proxies',
      new TableIndex({
        name: 'idx_expire_at',
        columnNames: ['expire_at'],
      }),
    );

    await queryRunner.createIndex(
      'static_proxies',
      new TableIndex({
        name: 'idx_order_no',
        columnNames: ['order_no'],
      }),
    );

    await queryRunner.createIndex(
      'static_proxies',
      new TableIndex({
        name: 'idx_last_synced_at',
        columnNames: ['last_synced_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除索引
    await queryRunner.dropIndex('static_proxies', 'idx_last_synced_at');
    await queryRunner.dropIndex('static_proxies', 'idx_order_no');
    await queryRunner.dropIndex('static_proxies', 'idx_expire_at');

    // 删除字段
    await queryRunner.dropColumn('static_proxies', 'last_synced_at');
    await queryRunner.dropColumn('static_proxies', 'plan');
    await queryRunner.dropColumn('static_proxies', 'expire_at');
    await queryRunner.dropColumn('static_proxies', 'order_no');
  }
}

