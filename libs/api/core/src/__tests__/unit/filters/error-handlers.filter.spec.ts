import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

import { ValidationErrorException } from '../../../validation/validation-error.exception';
import { ErrorHandlersFilter } from '../../../filters/error-handlers.filter';

describe('ErrorHandlersFilter', () => {
  let filter: ErrorHandlersFilter;
  let mockHost: ArgumentsHost;
  let mockResponse: Response;
  let mockApplicationRef: any;
  let mockHttpAdapterHost: any;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getArgByIndex: jest.fn(),
    } as any;

    mockApplicationRef = {
      reply: jest.fn(),
      isHeadersSent: jest.fn(),
    };

    mockHttpAdapterHost = {
      httpAdapter: mockApplicationRef,
    };

    filter = new ErrorHandlersFilter();
    (filter as any).applicationRef = mockApplicationRef;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore The 'logger' property is private but we want to avoid showing useless error logs
    BaseExceptionFilter.logger.error = () => {};
  });

  describe('catch', () => {
    it('should handle ValidationErrorException', () => {
      const errors = {};
      const exception = new ValidationErrorException(errors);

      filter.catch(exception, mockHost);

      expect(mockApplicationRef.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.any(ValidationErrorException),
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    });

    it('should call super.catch for non-ValidationErrorException', () => {
      const exception = new Error('test error');
      const superCatchSpy = jest.spyOn(BaseExceptionFilter.prototype, 'catch');

      filter.catch(exception, mockHost);

      expect(superCatchSpy).toHaveBeenCalledWith(exception, mockHost);
    });

    it('should use httpAdapterHost when applicationRef is not available', () => {
      (filter as any).applicationRef = undefined;
      (filter as any).httpAdapterHost = mockHttpAdapterHost;

      const errors = {};
      const exception = new ValidationErrorException(errors);

      filter.catch(exception, mockHost);

      expect(mockApplicationRef.reply).toHaveBeenCalled();
    });

    it('should throw error when both applicationRef and httpAdapterHost are undefined', () => {
      (filter as any).applicationRef = undefined;
      (filter as any).httpAdapterHost = undefined;

      const exception = new ValidationErrorException({});

      expect(() => filter.catch(exception, mockHost)).toThrow();
    });
  });
});
