import { MigrationInterface, QueryRunner } from "typeorm";

export class MergeGiftBalanceToBalance1762505970245 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Merge gift_balance into balance for all users
        await queryRunner.query(`
            UPDATE users 
            SET balance = balance + COALESCE(gift_balance, 0)
            WHERE gift_balance > 0;
        `);

        // Set gift_balance to 0 for all users (keeping column for potential rollback)
        await queryRunner.query(`
            UPDATE users 
            SET gift_balance = 0 
            WHERE gift_balance IS NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: This rollback assumes gift_balance data was already at 0 before up migration
        // In a real rollback scenario, you would need to restore from a backup
        console.warn('Warning: Rolling back MergeGiftBalanceToBalance may result in data loss.');
        console.warn('Restore from database backup if you need to recover gift_balance data.');
        
        // This is a safe no-op rollback that keeps data in balance
        // To truly rollback, restore from backup before running this
    }
}
