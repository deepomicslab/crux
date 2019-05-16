import { Anchor, GeometryOptValue, GeometryValue } from "../defs/geometry";

export interface BaseOption {
    role?: string;

    // presentation
    display?: boolean;
    anchor?: Anchor;
    x?: GeometryOptValue;
    y?: GeometryOptValue;

    rotation?: number | [number, number, number];
    rotateAfterTranslate?: boolean;

    detached: boolean;  // for Container

    // interactions
    tooltip?: any;
    zoom?: any;

    ref: string;

    debug: boolean;
}
