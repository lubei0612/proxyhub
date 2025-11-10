import { Module } from '@nestjs/common';
import { Proxy985Service } from './proxy985.service';
import { Proxy985Controller } from './proxy985.controller';

@Module({
  controllers: [Proxy985Controller],
  providers: [Proxy985Service],
  exports: [Proxy985Service],
})
export class Proxy985Module {}

