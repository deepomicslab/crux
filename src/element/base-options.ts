import { Anchor, GeometryOptValue } from "../defs/geometry";

export interface BaseOption {
    // presentation
    anchor?: Anchor;
    x?: GeometryOptValue;
    y?: GeometryOptValue;

    rotation?: number | [number, number, number];
    rotateAfterTranslate?: boolean;

    detached: boolean;  // for Container

    stage: string;

    // interactions
    tooltip?: any;
    zoom?: any;

    ref: string;

    debug: boolean;
}
