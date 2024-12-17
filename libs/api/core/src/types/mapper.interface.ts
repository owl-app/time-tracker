export interface Mapper<Request, Entity, Response> {
  toPersistence(request: Request): Entity;
  toResponse(entity: Entity): Response;
}
