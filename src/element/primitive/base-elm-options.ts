import { BaseOption } from "../base-options";

export interface BaseElementOption extends BaseOption {
    fill: string;
    fillOpacity: string;
    stroke: string;
    strokeOpacity: string;
    strokeWidth: number;
    dashArray: string;
    cursor: string;
}
