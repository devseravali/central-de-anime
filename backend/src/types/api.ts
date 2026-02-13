export interface ApiError {
  mensagem: string;
  codigo: string;
  timestamp: string;
}

export interface ApiResponseSuccess<T> {
  sucesso: true;
  dados: T;
}

export interface ApiResponseError {
  sucesso: false;
  dados: null;
  erro: ApiError;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export type ApiItemResponse<T> = ApiResponse<T>;
export type ApiListResponse<T> = ApiResponse<T[]>;