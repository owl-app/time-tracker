import { PUBLIC_ROUTE_KEY, Public } from "../../../metadata/route";

describe('Public Decorator', () => {

  @Public()
  class Test {}

  class TestWithMethod {
    @Public()
    public static test() {}
  }

  it('should work when applied to method class', () => {
    const metadata = Reflect.getMetadata(PUBLIC_ROUTE_KEY, TestWithMethod.test);
    expect(metadata).toBe(true);
  });

  it('should work when applied to class', () => {
    const metadata = Reflect.getMetadata(PUBLIC_ROUTE_KEY, Test);
    expect(metadata).toBe(true);
  });
});
