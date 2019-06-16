import { GeometryOptValue } from "../defs/geometry";
import { BaseOption } from "./base-options";

export interface ComponentOption extends BaseOption {
    width?: GeometryOptValue;
    height?: GeometryOptValue;

    xScale?: any;
    yScale?: any;
    coord?: "polar" | "cartesian";

    html?: string;

    clip?: string;
    opt?: Record<string, any>;
}
