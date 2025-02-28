import { DomainEvent, DomainEventProps } from '../../../event/domain-event.base';
import { ArgumentNotProvidedException } from '../../../exceptions/exceptions';
import { RequestContextService } from '../../../context/app-request-context';

describe('DomainEvent', () => {
  beforeEach(() => {
    jest.spyOn(RequestContextService, 'getRequestId').mockReturnValue('mock-request-id');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw ArgumentNotProvidedException when props is empty', () => {
    expect(() => new DomainEvent({} as DomainEventProps<unknown>)).toThrow(
      ArgumentNotProvidedException
    );
  });

  it('should set provided properties correctly', () => {
    const props: DomainEventProps<unknown> = {
      id: 'test-id',
      eventName: 'test-event',
      metadata: {
        correlationId: 'test-correlation-id',
        causationId: 'test-causation-id',
        timestamp: 123456,
        userId: 'test-user-id',
      },
    };
    const event = new DomainEvent(props);

    expect(event.id).toBe('test-id');
    expect(event.eventName).toBe('test-event');
    expect(event.metadata).toMatchObject({
      correlationId: 'test-correlation-id',
      causationId: 'test-causation-id',
      timestamp: 123456,
      userId: 'test-user-id',
    });
  });

  it('should set eventName to null if not provided', () => {
    const props: DomainEventProps<unknown> = {
      id: 'test-id',
    };
    const event = new DomainEvent(props);
    expect(event.eventName).toBeNull();
  });

  it('should use RequestContextService.getRequestId if correlationId not provided', () => {
    const props: DomainEventProps<unknown> = {
      id: 'test-id',
    };
    const event = new DomainEvent(props);
    expect(event.metadata?.correlationId).toBe('mock-request-id');
  });

  it('should set default timestamp if none is provided', () => {
    jest.spyOn(Date, 'now').mockReturnValue(888888);
    const props: DomainEventProps<unknown> = {
      id: 'test-id',
    };
    const event = new DomainEvent(props);
    expect(event.metadata?.timestamp).toBe(888888);
  });
});
