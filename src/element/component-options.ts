import { GeometryOptValue } from "../defs/geometry";
import { BaseOption } from "./base-options";

export interface ComponentOption extends BaseOption {
    width?: GeometryOptValue;
    height?: GeometryOptValue;
    opacity?: number;

    xScale?: any;
    yScale?: any;
    coord?: "polar" | "cartesian";
    coordUseRad?: boolean;

    html?: string;

    clip?: string;
    opt?: Record<string, any>;

    context?: any;
    static?: boolean | (() => boolean);
}
