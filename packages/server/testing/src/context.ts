export interface Context {
    readonly resultSeed: Record<string, unknown>;

    addResultSeed<T>(key: string, value: T): void;
}

export class TestContext {
    readonly resultSeed: Record<string, unknown> = {};

    addResultSeed<T>(key: string, value: T): void {
        this.resultSeed[key] = value;
    }
}
