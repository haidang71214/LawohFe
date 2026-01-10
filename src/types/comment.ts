import { ResponseDto } from './base';

export interface CommentItemResponseDto {
  _id: string;
  content: string;
  author_id: any;
  parent_comment_id?: string;
  replies?: any[];
  createdAt?: string | Date;
}

export interface CreateCommentRequestDto {
  videoId?: string;
  content: string;
  parent_comment_id?: string;
}

// Wrapper Response Classes
export type CommentResponse = ResponseDto<CommentItemResponseDto>;
export type CommentResponseDto = ResponseDto<CommentItemResponseDto>;

export type CommentListResponse = ResponseDto<CommentItemResponseDto[]>;
export type CommentListResponseDto = ResponseDto<CommentItemResponseDto[]>;
