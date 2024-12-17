import { ArgumentNotProvidedException } from '../exceptions/exceptions';
import { Guard } from '../guard';
import { RequestContextService } from '../context/app-request-context';

type DomainEventMetadata = {
  /** Timestamp when this domain event occurred */
  readonly timestamp: number;

  /** ID for correlation purposes (for Integration Events,logs correlation, etc).
   */
  readonly correlationId: string;

  /**
   * Causation id used to reconstruct execution order if needed
   */
  readonly causationId?: string;

  /**
   * User ID for debugging and logging purposes
   */
  readonly userId?: string;
};

export type DomainEventProps<T> = Omit<T, 'id' | 'metadata' | 'eventName'> & {
  id?: string;
  metadata?: DomainEventMetadata;
  eventName?: string;
};

export class DomainEvent {
  public readonly id?: string;

  public readonly metadata?: DomainEventMetadata;

  public readonly eventName?: string;

  constructor(props: DomainEventProps<unknown>) {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException('DomainEvent props should not be empty');
    }
    this.id = props.id;
    this.eventName = props.eventName ?? null;
    this.metadata = {
      correlationId: props?.metadata?.correlationId || RequestContextService.getRequestId(),
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
