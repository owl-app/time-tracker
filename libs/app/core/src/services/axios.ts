import axios from 'axios';
import type {
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

export interface ApiConfig<D> extends AxiosRequestConfig<D> {
  isAuthenticated?: boolean;
}

export interface Api {
  interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
  request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
  get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: ApiConfig<D>): Promise<R>;
  delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: ApiConfig<D>): Promise<R>;
  head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: ApiConfig<D>): Promise<R>;
  options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: ApiConfig<D>): Promise<R>;
  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: ApiConfig<D>
  ): Promise<R>;
  put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: ApiConfig<D>
  ): Promise<R>;
  patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: ApiConfig<D>
  ): Promise<R>;
}

export type CreateApiDefaults<D = any> = CreateAxiosDefaults<D> & ApiConfig<D>;

export type RequestConfig<D = any> = InternalAxiosRequestConfig<D> &
  ApiConfig<D> & {
    id?: string;
    start?: number;
    measureLatency?: boolean;
  };

export type Response = AxiosResponse & { config: RequestConfig };

export function createApi(axiosConfig?: CreateApiDefaults): Api {
  const api = axios.create(axiosConfig);

  return {
    interceptors: api.interceptors,
    ...{
      async request<T = any, R = AxiosResponse<T>, D = any>(
        config: AxiosRequestConfig<D>
      ): Promise<R> {
        return api.request(config);
      },
      async get<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.get(url, config);
      },
      async delete<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.delete(url, config);
      },
      async head<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.head(url, config);
      },
      async options<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.options(url, config);
      },
      async post<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.post(url, data, config);
      },
      async put<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.put(url, data, config);
      },
      patch<T = any, R = AxiosResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: ApiConfig<D>
      ): Promise<R> {
        return api.patch(url, data, config);
      },
    },
  };
}
