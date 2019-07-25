export abstract class Behavior {
    public abstract events: string[];
    public abstract updateProps(op: any): void;
}
