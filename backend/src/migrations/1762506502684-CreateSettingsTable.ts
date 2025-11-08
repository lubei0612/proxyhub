import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTable1762506502684 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create settings table
        await queryRunner.query(`
            CREATE TABLE settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Insert default Telegram support links
        await queryRunner.query(`
            INSERT INTO settings (key, value) VALUES
                ('telegram_support_1', 'lubei12'),
                ('telegram_support_2', 'lubei12');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS settings;`);
    }
}
