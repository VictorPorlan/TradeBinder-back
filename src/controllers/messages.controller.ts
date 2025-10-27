import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateMessageDto, MessageResponseDto, ConversationResponseDto, MarkAsReadDto } from '../dto/messages.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    return this.messagesService.createMessage(createMessageDto, req.user.id);
  }

  @Get()
  async getConversations(@Request() req: any): Promise<ConversationResponseDto[]> {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('listing/:listingId')
  async getMessagesByListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: any,
  ): Promise<MessageResponseDto[]> {
    return this.messagesService.getMessagesByListing(listingId, req.user.id);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) messageId: number,
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    return this.messagesService.markAsRead(messageId, req.user.id);
  }

  @Put('listing/:listingId/read-all')
  async markAllAsRead(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.messagesService.markAllAsRead(listingId, req.user.id);
    return { message: 'Todos los mensajes han sido marcados como leídos' };
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }
}

