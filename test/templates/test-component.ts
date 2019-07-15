import { Component } from "../../src/element";
import { template } from "../../src/template/tag";
import mouse from "../../src/utils/mouse";

export class MyComponent extends Component {
    public render = template`
    Component {
        Rect {
            width = 100%; height = 100%;
            fill = "red"
            on:mousemove = mover
        }
    }
    `;

    private mover(ev: MouseEvent, el: any) {
        const m = mouse(el, ev);
    }
}
