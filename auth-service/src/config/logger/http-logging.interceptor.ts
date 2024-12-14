import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios'; // Use 'InternalAxiosRequestConfig' instead of 'AxiosRequestConfig'
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HttpLoggingInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(private readonly httpService: HttpService) {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercept outgoing requests
    this.httpService.axiosRef.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log the request details
        this.logger.log(`================================================================`);
        this.logger.log(`URL: ${config.method?.toUpperCase()} ${config.url}`);
        this.logger.log(`HEADERS: ${JSON.stringify(config.headers)}`);
        this.logger.log(`REQUEST: ${JSON.stringify(config.data)}`);
        this.logger.log(`================================================================`);
        return config;
      },
      (error) => {
        // Log any request errors
        this.logger.error(`Request error: ${error.message}`, error.stack);
        return Promise.reject(error);
      },
    );

    // Intercept incoming responses
    this.httpService.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log the response details
        this.logger.log(`================================================================`);
        this.logger.log(`STATUS: ${response.status} ${response.statusText}`);
        this.logger.log(`HEADER: ${JSON.stringify(response.headers)}`);
        this.logger.log(`RESPONSE: ${JSON.stringify(response.data)}`);
        this.logger.log(`================================================================`);
        return response;
      },
      (error) => {
        // Log any response errors
        this.logger.error(`Response error: ${error.message}`, error.stack);
        return Promise.reject(error);
      },
    );
  }
}