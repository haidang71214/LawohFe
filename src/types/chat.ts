import { ResponseDto } from './base';

export interface MessageItemResponseDto {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string | Date;
}

export interface ConversationItemResponseDto {
  _id: string;
  participants: any[];
  lastMessage?: any;
  createdAt?: string | Date;
}

export interface CreateMessageRequestDto {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface CreateConversationRequestDto {
  participants: string[];
}

// Wrapper Response Classes
export type MessageResponse = ResponseDto<MessageItemResponseDto>;
export type MessageResponseDto = ResponseDto<MessageItemResponseDto>;

export type MessageListResponse = ResponseDto<MessageItemResponseDto[]>;
export type MessageListResponseDto = ResponseDto<MessageItemResponseDto[]>;

export type ConversationResponse = ResponseDto<ConversationItemResponseDto>;
export type ConversationResponseDto = ResponseDto<ConversationItemResponseDto>;

export type ConversationListResponse = ResponseDto<ConversationItemResponseDto[]>;
export type ConversationListResponseDto = ResponseDto<ConversationItemResponseDto[]>;
