import Crux from "../../../src";

export default class MyComponent extends Crux.Component {
    public render = Crux.template`
    Component {
        Rect {
            width = 100%; height = 100%;
            fill = "red"
            on:mousemove = mover
        }
    }
    `;

    private mover(ev: MouseEvent, el: any) {
        const m = Crux.utils.mouse(el, ev);
    }
}
