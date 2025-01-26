import { EventEmitter2 } from '@nestjs/event-emitter';
import DomainEventableEntity from '../../../../database/entity/domain-eventable.entity';
import { DomainEvent } from '../../../../event/domain-event.base';

jest.mock('@nestjs/event-emitter');

describe('DomainEventableEntity', () => {
  let entity: DomainEventableEntity;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    entity = new DomainEventableEntity();
    eventEmitter = new EventEmitter2();
  });

  describe('publishEvents', () => {
    it('should not emit any events if there are no domain events', async () => {
      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValue([]);

      await entity.publishEvents('test-id', eventEmitter);

      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('should emit events if there are domain events', async () => {
      const mockEvent: DomainEvent = { eventName: 'TestEvent' };
      entity.addEvent(mockEvent);

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValue([true]);

      await entity.publishEvents('test-id', eventEmitter);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'TestEvent',
        expect.objectContaining({ id: 'test-id' })
      );
      expect(entity.domainEvents).toHaveLength(0);
    });

    it('should clear events after publishing', async () => {
      const mockEvent: DomainEvent = { eventName: 'TestEvent' };
      entity.addEvent(mockEvent);

      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValue([true]);

      await entity.publishEvents('test-id', eventEmitter);

      expect(entity.domainEvents).toHaveLength(0);
    });

    it('should handle errors during event emission', async () => {
      const mockEvent: DomainEvent = { eventName: 'TestEvent' };
      entity.addEvent(mockEvent);

      jest.spyOn(eventEmitter, 'emitAsync').mockRejectedValue(new Error('Emit error'));

      await expect(entity.publishEvents('test-id', eventEmitter)).rejects.toThrow('Emit error');
    });
  });
});
