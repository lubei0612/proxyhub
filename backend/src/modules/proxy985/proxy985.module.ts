import { Module } from '@nestjs/common';
import { Proxy985Service } from './proxy985.service';

@Module({
  providers: [Proxy985Service],
  exports: [Proxy985Service],
})
export class Proxy985Module {}

