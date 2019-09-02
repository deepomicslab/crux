import { ColorScheme } from "./color-scheme";

interface HSL { h: number; s: number; l: number; }

export interface ColorSchemeCategoryOption {
    colors?: string[];
    initialColor?: HSL;
}

export class ColorSchemeCategory<T extends number|string> implements ColorScheme {
    public colors: Record<T, string>;
    public categories: string[];

    constructor(data: any, initialColor?: HSL) {
        if (Array.isArray(data)) {
            this.categories = data;
            const n = this.categories.length;
            const gap1Count = n / 2;
            const gap2Count = gap1Count + n % 2;
            const gap1Size = 360.0 / (gap1Count + gap2Count * 1.25);
            const gap2Sise = gap1Size * 1.618;
            let a = 0;
            let flag = false;
            this.colors = {} as any;
            let ih: number, is: number, il: number;
            if (initialColor) {
                [ih, is, il] = [initialColor.h, initialColor.s, initialColor.l];
            } else {
                [ih, is, il] = [200, 80, 50];
            }
            this.categories.forEach((c, i) => {
                let h = ih + a;
                if (h > 360) h -= 360;
                this.colors[c] = `hsl(${h},${is + (flag ? 5 : 5)}%,${il + (flag ? 5 : -5)}%)`;
                a += flag ? gap1Size : gap2Sise;
                flag = !flag;
            });
        } else {
            this.colors = data;
            this.categories = Object.keys(data);
        }
    }

    public getColor(category: number|string) {
        return this.colors[category] || "#000";
    }

    public legendData() {
        return this.categories.map(c => ({ label: c.toString(), fill: this.getColor(c)}));
    }

    public static create<T extends (number | string)>(k: number | T[], opt?: ColorSchemeCategoryOption): ColorSchemeCategory<T> {
        let colors: T[] | Record<T, string>;
        if (typeof k === "number") {
            colors = Array.from(Array(k)).map((_, i) => i) as T[];
        } else if (opt && opt.colors) {
            colors = {} as Record<T, string>;
            for (let i = 0; i < k.length; i++) {
                colors[k[i]] = opt.colors[i];
            }
        } else {
            colors = k;
        }
        const initialColor = opt && opt.initialColor ? opt.initialColor : undefined;
        return new ColorSchemeCategory(colors, initialColor);
    }
}
