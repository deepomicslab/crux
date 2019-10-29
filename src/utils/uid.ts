export class UIDGenerator {
    private counter = 0;
    private loopCounter = 0;
    private prefixes: number[] = [];

    public gen(): number {
        return this.counter++;
    }

    public enterComponent() {
        this.prefixes.push(-1);
    }

    public exitComponent() {
        this.prefixes.pop();
    }

    public enterLoop() {
        this.prefixes.push(this.loopCounter++);
    }

    public exitLoop() {
        this.prefixes.pop();
    }

    public inList() {
        return this.prefixes[this.prefixes.length - 1] >= 0;
    }
}

export const defaultUIDGenerator = new UIDGenerator();
