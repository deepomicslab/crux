export interface ColorScheme {
    get(category: number|string): string;
    legendData(): any;
}
