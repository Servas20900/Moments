import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [PrismaModule],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
