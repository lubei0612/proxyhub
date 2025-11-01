import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762006678581 implements MigrationInterface {
    name = 'InitialSchema1762006678581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "nickname" character varying(100), "role" character varying(20) NOT NULL DEFAULT 'user', "balance" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying(20) NOT NULL DEFAULT 'active', "apiKey" character varying(64), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_c654b438e89f6e1fbd2828b5d37" UNIQUE ("apiKey"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "order_no" character varying(50) NOT NULL, "type" character varying(20) NOT NULL, "amount" numeric(10,2) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "remark" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_035026a83bef9740d7ad05df383" UNIQUE ("order_no"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "static_proxies" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "order_id" integer, "channel_name" character varying(100) NOT NULL, "ip" character varying(50) NOT NULL, "port" integer NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, "country" character varying(10) NOT NULL, "country_name" character varying(100) NOT NULL, "city_name" character varying(100), "ip_type" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "expire_time_utc" TIMESTAMP NOT NULL, "release_time_utc" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9afe613a4206cac1a661506ab56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "transaction_no" character varying(50) NOT NULL, "type" character varying(20) NOT NULL, "amount" numeric(10,2) NOT NULL, "balance_before" numeric(10,2) NOT NULL, "balance_after" numeric(10,2) NOT NULL, "remark" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_36224abf7dbb12700c2b12fd09e" UNIQUE ("transaction_no"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usage_records" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "proxy_type" character varying(20) NOT NULL, "traffic_gb" numeric(10,4) NOT NULL, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e511cf9f7dc53851569f87467a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recharges" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "order_no" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_method" character varying(50) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "remark" text, "admin_remark" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_244817dea9059b8cd8301550ae6" UNIQUE ("order_no"), CONSTRAINT "PK_19efa203cefcf8cf544d7ea7e33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" SERIAL NOT NULL, "key" character varying(100) NOT NULL, "value" text NOT NULL, "description" text, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b1b5bc664526d375c94ce9ad43d" UNIQUE ("key"), CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "static_proxies" ADD CONSTRAINT "FK_4db3908234cb8f4b4e2f38c9982" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "static_proxies" ADD CONSTRAINT "FK_677814bb0741ce951e5a2081146" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usage_records" ADD CONSTRAINT "FK_2930a10f82d7773e3ac09e78dd8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recharges" ADD CONSTRAINT "FK_b695fbcce1226e00d1107d5e028" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recharges" DROP CONSTRAINT "FK_b695fbcce1226e00d1107d5e028"`);
        await queryRunner.query(`ALTER TABLE "usage_records" DROP CONSTRAINT "FK_2930a10f82d7773e3ac09e78dd8"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`ALTER TABLE "static_proxies" DROP CONSTRAINT "FK_677814bb0741ce951e5a2081146"`);
        await queryRunner.query(`ALTER TABLE "static_proxies" DROP CONSTRAINT "FK_4db3908234cb8f4b4e2f38c9982"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
        await queryRunner.query(`DROP TABLE "recharges"`);
        await queryRunner.query(`DROP TABLE "usage_records"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "static_proxies"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
