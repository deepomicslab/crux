import { Component } from "../element/component";

export class RootComponent extends Component {
    public setProp(prop) {
        super.setProp(prop);
        this._defaultedWidth = true;
        this._defaultedHeight = true;
    }
}
