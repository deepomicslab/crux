import * as d3s from "d3-scale";
import { Color, ColorSchemeGradient } from "../../color";
import { minmax } from "../../utils/math";

export interface IConfig {
    annotation:
        | string[]
        | number[]
        | Record<string, Record<string, string[]>>
        | Record<string, string[]>;
    colorShare?: boolean;
}

interface IScheme {
    colors: Record<string, any>;
    share?: Record<string, any>;
    keys: null | Array<string | number>;
    value?: Array<string | number> | Record<string, any>;
}

export class AnnotationColor {
    private config: IConfig;
    private scheme!: IScheme;
    private color: Color = new Color();

    constructor(config: IConfig) {
        this.config = config;

        this.scheme = {
            colors: {},
            keys: Array.isArray(config.annotation) ? null : [],
            value: Array.isArray(config.annotation) ? [] : {},
        };
        this.assignColor(config.annotation);
    }

    private create(value: any[]) {
        const length = value.length;
        const avg = 360 / length;
        const colors = {};

        value.forEach((row, index) => {
            if (Number(row) === 0) colors[row] = "grey";
            else {
                this.color.hsl = [index * avg, 100, 50];
                colors[row] = this.color.string;
            }
        });

        return {
            value,
            colors,
        };
    }

    private assignColor(dict: Record<string, any>) {
        const isArray = Array.isArray(dict);
        if (!isArray) {
            const valueSet = new Set<any>();
            const keys = Object.keys(dict).filter(
                (e) => e.indexOf("cont_") > -1,
            );
            let index = 0;
            for (const [key, value] of Object.entries(dict)) {
                const isCont = key.indexOf("cont_") > -1;
                if (isCont) {
                    const [min, max] = minmax(
                        value.map((value: number) => value),
                    );
                    this.color.hsl = [index++ * (360 / keys.length), 100, 50];
                    this.scheme.colors[key] = {
                        color: ColorSchemeGradient.create(
                            "#FFFFFF",
                            this.color.string,
                        ),
                        scale: d3s
                            .scaleLinear()
                            .domain([min, max])
                            .range([0, 1]),
                        min,
                        max,
                        value,
                    };
                } else {
                    if (this.config.colorShare) {
                        value.forEach((val: number | string) => {
                            valueSet.add(val);
                        });
                    } else {
                        this.scheme.colors[key] = this.create(value);
                    }
                }
            }
            if (this.config.colorShare)
                this.scheme.share = this.create(Array.from(valueSet));
            else this.scheme.keys = Object.keys(dict);
        } else {
            this.scheme = {
                ...this.create([...new Set(dict as Array<string | number>)]),
                keys: null,
            };
        }
    }

    public get(key: string, value: string) {
        if (key.indexOf("cont_") > -1) {
            const row = this.scheme.colors[key];
            return row.color.get(row.scale(value));
        } else {
            if (this.config.colorShare) {
                return this.scheme.share!.colors[value];
            } else {
                if (Array.isArray(this.config.annotation)) {
                    return this.scheme.colors[value];
                } else {
                    return this.scheme.colors[key].colors[value];
                }
            }
        }
    }

    get keys() {
        return this.scheme.keys;
    }

    get colorScheme() {
        return this.scheme;
    }
}
