import { BaseOption } from "../base-options";

export interface BaseElementOption extends BaseOption {
    fill: string;
    fillOpacity: string;
    stroke: string;
    strokeOpacity: string;
    strokeWidth: number;
    strokeDashArray: string;
    cursor: string;
}
