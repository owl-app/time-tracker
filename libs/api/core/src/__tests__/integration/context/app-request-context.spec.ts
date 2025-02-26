import { AuthUserData } from '@owl-app/lib-contracts';
import { DataSource, EntityManager } from 'typeorm';
import { AppRequestContext, RequestContextService } from '../../../context/app-request-context';
import { getDbConfig } from '../../config/db';

describe('RequestContextService', () => {
  let mockRequestContext: AppRequestContext;

  const getEntityManagerMock = async (): Promise<EntityManager> => {
    const manager = new EntityManager(new DataSource(getDbConfig()));

    return manager;
  };

  beforeEach(() => {
    mockRequestContext = new AppRequestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getContext', () => {
    it('should return a new context if current context is not set', () => {
      const context = RequestContextService.getContext();
      expect(context).toBeInstanceOf(AppRequestContext);
    });
  });

  describe('getRequestId', () => {
    it('should return the request ID from the context', () => {
      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.requestId = '12345';
      const requestId = RequestContextService.getRequestId();
      expect(requestId).toBe('12345');
    });
  });

  describe('getTransactionConnection', () => {
    it('should return the transaction manager from the context', async () => {
      const mockEntityManager = await getEntityManagerMock();

      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.transactionManager = mockEntityManager;
      const transactionManager = RequestContextService.getTransactionConnection();
      expect(transactionManager).toBe(mockEntityManager);
    });
  });

  describe('setTransactionConnection', () => {
    it('should set the transaction manager in the context', async () => {
      const mockEntityManager = await getEntityManagerMock();

      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      RequestContextService.setTransactionConnection(mockEntityManager);
      expect(mockRequestContext.transactionManager).toBe(mockEntityManager);
    });
  });

  describe('cleanTransactionConnection', () => {
    it('should clear the transaction manager in the context', async () => {
      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.transactionManager = await getEntityManagerMock();
      RequestContextService.cleanTransactionConnection();
      expect(mockRequestContext.transactionManager).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user from the context', () => {
      const mockUser: AuthUserData = {
        id: 'string',
        username: 'string',
        email: 'string',
        tenant: { id: 'string', name: 'string' },
        roles: ['string'],
        permissions: {
          routes: ['string'],
          fields: ['string'],
        },
      };

      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.user = mockUser;
      const user = RequestContextService.getCurrentUser();
      expect(user).toBe(mockUser);
    });

    it('should return null if no user is set in the context', () => {
      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.user = null;
      const user = RequestContextService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getCurrentUserId', () => {
    it('should return the current user ID from the context', () => {
      const mockUser: AuthUserData = {
        id: 'string',
        username: 'string',
        email: 'string',
        tenant: { id: 'string', name: 'string' },
        roles: ['string'],
        permissions: {
          routes: ['string'],
          fields: ['string'],
        },
      };

      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.user = mockUser;
      const userId = RequestContextService.getCurrentUserId();
      expect(userId).toBe('string');
    });

    it('should return null if no user is set in the context', () => {
      jest.spyOn(RequestContextService, 'getContext').mockReturnValue(mockRequestContext);

      mockRequestContext.user = null;
      const userId = RequestContextService.getCurrentUserId();
      expect(userId).toBeNull();
    });
  });
});
