import { ResponseDto, PaginatedData } from './base';
import { AcceptRejectAction, VideoLawCategory } from './enum';

export interface VideoItemResponseDto {
  _id: string;
  categories: VideoLawCategory | string;
  thubnail_url?: string;
  thumnail_url?: string;
  video_url?: string;
  description: string;
  status: string;
  accept?: boolean;
  author_id?: any;
  star?: number;
  user_id?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface VideoListResponseDataDto extends PaginatedData<VideoItemResponseDto> {
  data: VideoItemResponseDto[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

export interface CreateVideoRequestDto {
  categories: VideoLawCategory | string;
  description: string;
  thubnail?: File | Blob | any;
  video?: File | Blob | any;
  videoFile?: File | Blob | any;
  thumbnailFile?: File | Blob | any;
}

export interface AcceptRejectVideoRequestDto {
  reason: string;
  action: 'accept' | 'reject' | AcceptRejectAction;
}

export interface ModerateVideoRequestDto {
  id: string;
  action?: 'accept' | 'reject' | AcceptRejectAction;
  accept?: boolean;
  reason?: string;
}

// Wrapper Response Classes
export type VideoResponse = ResponseDto<VideoItemResponseDto>;
export type VideoResponseDto = ResponseDto<VideoItemResponseDto>;

export type VideoListResponse = ResponseDto<VideoItemResponseDto[] | VideoListResponseDataDto>;
export type VideoListResponseDto = ResponseDto<VideoListResponseDataDto>;
