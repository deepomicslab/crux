export class UIDGenerator {
    private counter = 0;

    public gen(): number {
        return this.counter++;
    }
}

export const defaultUIDGenerator = new UIDGenerator();
