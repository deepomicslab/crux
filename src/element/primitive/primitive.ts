import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

export abstract class PrimitiveElement<Option extends BaseElementOption = BaseElementOption>
    extends BaseElement<Option> {
    // tslint:disable-next-line: variable-name
    public __primitive__ = true;
}
