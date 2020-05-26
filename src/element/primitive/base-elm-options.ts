import Type, { TypeDef } from "../../utils/type-check";
import { BaseOption, basePropType } from "../base-options";

export interface BaseElementOption extends BaseOption {
    fill: string;
    fillOpacity: string;
    stroke: string;
    strokeOpacity: string;
    strokeWidth: number;
    dashArray: string;
}

export const baseElementPropType: Record<string, TypeDef> = {
    ...basePropType,
    fill: Type.color,
    fillOpacity: Type.number,
    stroke: Type.color,
    strokeOpacity: Type.number,
    strokeWidth: Type.number,
    dashArray: Type.string,
};
