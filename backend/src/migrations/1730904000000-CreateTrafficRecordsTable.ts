import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTrafficRecordsTable1730904000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建 traffic_records 表
    await queryRunner.createTable(
      new Table({
        name: 'traffic_records',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'proxy_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'proxy_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: '代理类型: static_residential, dynamic_residential, datacenter, mobile',
          },
          {
            name: 'record_date',
            type: 'date',
            isNullable: false,
            comment: '记录日期（UTC）',
          },
          {
            name: 'requests_total',
            type: 'bigint',
            default: 0,
            comment: '总请求数',
          },
          {
            name: 'requests_success',
            type: 'bigint',
            default: 0,
            comment: '成功请求数',
          },
          {
            name: 'requests_failed',
            type: 'bigint',
            default: 0,
            comment: '失败请求数',
          },
          {
            name: 'traffic_upload',
            type: 'decimal',
            precision: 15,
            scale: 3,
            default: 0,
            comment: '上传流量（GB）',
          },
          {
            name: 'traffic_download',
            type: 'decimal',
            precision: 15,
            scale: 3,
            default: 0,
            comment: '下载流量（GB）',
          },
          {
            name: 'traffic_total',
            type: 'decimal',
            precision: 15,
            scale: 3,
            default: 0,
            comment: '总流量（GB）',
          },
          {
            name: 'protocol_http',
            type: 'bigint',
            default: 0,
            comment: 'HTTP请求数',
          },
          {
            name: 'protocol_https',
            type: 'bigint',
            default: 0,
            comment: 'HTTPS请求数',
          },
          {
            name: 'protocol_websocket',
            type: 'bigint',
            default: 0,
            comment: 'WebSocket请求数',
          },
          {
            name: 'protocol_other',
            type: 'bigint',
            default: 0,
            comment: '其他协议请求数',
          },
          {
            name: 'remark',
            type: 'text',
            isNullable: true,
            comment: '备注',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.createIndex(
      'traffic_records',
      new TableIndex({
        name: 'idx_user_date',
        columnNames: ['user_id', 'record_date'],
      }),
    );

    await queryRunner.createIndex(
      'traffic_records',
      new TableIndex({
        name: 'idx_proxy_date',
        columnNames: ['proxy_id', 'record_date'],
      }),
    );

    await queryRunner.createIndex(
      'traffic_records',
      new TableIndex({
        name: 'idx_record_date',
        columnNames: ['record_date'],
      }),
    );

    // 创建外键
    await queryRunner.createForeignKey(
      'traffic_records',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'traffic_records',
      new TableForeignKey({
        columnNames: ['proxy_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'static_proxies',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('traffic_records');
    
    // 删除外键
    const foreignKeys = table.foreignKeys;
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('traffic_records', foreignKey);
    }

    // 删除索引
    await queryRunner.dropIndex('traffic_records', 'idx_user_date');
    await queryRunner.dropIndex('traffic_records', 'idx_proxy_date');
    await queryRunner.dropIndex('traffic_records', 'idx_record_date');

    // 删除表
    await queryRunner.dropTable('traffic_records');
  }
}

