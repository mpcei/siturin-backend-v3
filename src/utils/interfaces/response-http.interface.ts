export interface ResponseHttpInterface<T = object | boolean | number | string | null | undefined> {
  data: T;
  message: string | string[];
  title: string;
  pagination?: T;
}

export interface ErrorResponseHttpModel {
  data?: any;
  error: string;
  message: string | string[];
}
