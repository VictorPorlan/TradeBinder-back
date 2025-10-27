import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseIntPipe,
  Request
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { 
  CreateTransactionDto, 
  UpdateTransactionStatusDto, 
  SearchTransactionsDto,
  CompleteTransactionDto
} from '../dto/transactions.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.createTransaction(
        createTransactionDto, 
        req.user.id
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() searchDto: SearchTransactionsDto,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.findAll(searchDto, req.user.id);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.findOne(id, req.user.id);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateTransactionStatusDto,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.updateStatus(id, updateStatusDto, req.user.id);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  @Post(':id/complete')
  async completeTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeDto: CompleteTransactionDto,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.completeTransaction(id, completeDto, req.user.id);
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw error;
    }
  }

  @Post(':id/cancel')
  async cancelTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    try {
      return await this.transactionsService.cancelTransaction(id, req.user.id);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }
}
