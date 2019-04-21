import { GeometryOptValue } from "../defs/geometry";
import { BaseOption } from "./base-options";

export interface ComponentOption extends BaseOption {
    width?: GeometryOptValue;
    height?: GeometryOptValue;

    xScale?: any;
    yScale?: any;

    html?: string;

    clipPath?: string;
}
