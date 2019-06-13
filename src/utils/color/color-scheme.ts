export interface ColorScheme {
    getColor(category: number|string): string;
    legendData(): any;
}
