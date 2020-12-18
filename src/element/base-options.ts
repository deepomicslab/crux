import { Anchor, GeometryOptValue } from "../defs/geometry";
import Type, { TypeDef } from "../utils/type-check";

export interface BaseOption {
    // presentation
    anchor?: Anchor;
    x?: GeometryOptValue;
    y?: GeometryOptValue;
    zIndex?: number;

    rotation?: number | [number, number, number];
    rotateAfterTranslate?: boolean;

    cursor: string;
    visible: boolean;
    events: string;

    detached: boolean; // for Container

    stage: string;

    // interactions
    tooltip?: any;
    zoom?: any;

    ref: string;

    debug: boolean;
}

export const basePropType: Record<string, TypeDef> = {
    x: Type.geoValue,
    y: Type.geoValue,
};
