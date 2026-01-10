import { ResponseDto } from './base';

export interface ClassificationDataDto {
  category: string;
  lawyers?: any[];
}

export interface ClassificationRequestDto {
  text: string;
}

// Wrapper Response Classes
export type ClassificationResponse = ResponseDto<ClassificationDataDto>;
export type ClassificationResponseDto = ResponseDto<ClassificationDataDto>;

export type ClassificationCategoriesResponse = ResponseDto<{ categories: string[] }>;
export type ClassificationCategoriesResponseDto = ResponseDto<{ categories: string[] }>;
