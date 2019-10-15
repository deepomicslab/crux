import Crux from "../../../src";

Crux.c(`Component { Rect.full { fill = "blue" } }`, "Component2");

export default class MyComponent extends Crux.Component {
    public render() {
        return this.t`
        Component {
            @let f = {
                fill: "red"
            }
            Rect {
                width = 100%; height = 100%
                fill = "red"
                on:click = setState({
                    value: state.value + 1
                })
                on:mousemove = mover
            }
            Component2 {
                width = 50%
                height = 200
            }
            Text(state.value);
        }
        `;
    }

    public state = {
        value: 0,
    };

    private mover(ev: MouseEvent, el: any) {
        const m = Crux.utils.mouse(el, ev);
    }
}
