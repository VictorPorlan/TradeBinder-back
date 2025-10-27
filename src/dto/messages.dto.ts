import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsNumber()
  receiverId: number;

  @IsNumber()
  listingId: number;
}

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  content?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}

export class MessageResponseDto {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderId: number;
  receiverId: number;
  listingId: number;
  sender?: {
    id: number;
    username: string;
    email: string;
  };
  receiver?: {
    id: number;
    username: string;
    email: string;
  };
  listing?: {
    id: number;
    title: string;
    price: number;
  };
}

export class ConversationResponseDto {
  listingId: number;
  listing: {
    id: number;
    title: string;
    price: number;
    card: {
      name: string;
      imageUrl?: string;
    };
  };
  otherUser: {
    id: number;
    username: string;
    email: string;
  };
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  };
  unreadCount: number;
  totalMessages: number;
}

export class MarkAsReadDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}

