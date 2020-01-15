import { Color } from "../color";
import { getTheme } from "../global";

type SchemeDef = string[] | {
    extends: string;
    transform: (c: Color, i: number) => Color;
};

export interface ThemeDef {
    extends?: string;
    colors?: {
        line?: string;
        text?: string;
        theme?: string;
        [k: string]: string | undefined;
    };
    schemes?: {
        main?: SchemeDef;
        [k: string]: SchemeDef | undefined;
    };
}

export class Theme {
    public colors: Record<string, Color>;
    public schemes: Record<string, Color[]>;

    constructor(public def: ThemeDef) {
        this.colors = {};
        this.schemes = {};
        if (!def.colors) def.colors = {};
        if (!def.schemes) def.schemes = {};

        let baseSchemes = {};
        if (def.extends) {
            const baseTheme = getTheme(def.extends);
            for (const [k, color] of Object.entries(baseTheme.colors)) {
                this.colors[k] = color.clone();
            }
            baseSchemes = baseTheme.schemes;
        }
        for (const [k, color] of Object.entries(def.colors)) {
            this.colors[k] = Color.literal(color!);
        }

        Object.assign(this.schemes, baseSchemes);
        if (def.schemes) {
            this._parseScheme(def.schemes, baseSchemes);
        }
    }

    private _parseScheme(schemes: Record<string, SchemeDef | undefined>, baseSchemes: Record<string, Color[]>) {
        for (const [k, def] of Object.entries(schemes)) {
            if (!def) continue;
            if (Array.isArray(def)) {
                this.schemes[k] = def.map(color => color[0] === "$" ? this.colors[color.substr(1)]! : Color.literal(color));
            } else if (def.extends) {
                const base = baseSchemes[def.extends];
                if (!base) throw new Error(`Cannot find color scheme "${def.extends}" to extend`);
                this.schemes[k] = base.map((c, i) => def.transform(c, i));
            }
        }
    }
}
