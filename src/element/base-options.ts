import { Anchor, GeometryOptValue, GeometryValue } from "../defs/geometry";

export interface BaseOption {
    role?: string;

    // presentation
    display?: boolean;
    anchor?: Anchor;
    x?: GeometryOptValue;
    y?: GeometryOptValue;
    "x.scaled"?: GeometryOptValue;
    "y.scaled"?: GeometryOptValue;

    rotation?: number | [number, number, number];
    rotateAfterTranslate?: boolean;

    html?: string;

    detached: boolean;  // for Container

    // interactions
    tooltip?: any;
    activeClass?: string;

    ref: string;

    svgProp: {
        [name: string]: boolean | number | string | any[] | {[k: string]: any};
    };
}
