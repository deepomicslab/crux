import Crux from "../../../src";

export default class Clock extends Crux.Component {
    public render = Crux.t`
    Component {
        Component {
            width = 100%
            height = 100%
            coord = "polar"
            Circle.centered {
                r = 80; fill = "#333"
            }
            @let ticks = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            @for number in ticks {
                Text {
                    anchor = @anchor("middle", "center")
                    key = number
                    x = number * 30; y = 70
                    text = number
                    fill = "#fff"
                }
            }
            RadicalLine {
                x = state.s * 6;
                r1 = 0; r2 = 75; stroke = "red"
            }
            RadicalLine {
                x = state.m * 6;
                r1 = 0; r2 = 70; stroke = "#aaa"; strokeWidth = 2
            }
            RadicalLine {
                x = state.h * 30;
                r1 = 0; r2 = 50; stroke = "#777"; strokeWidth = 4
            }
        }
    }
    `;

    public state = {
        stage: null,
        h: 0,
        m: 0,
        s: 0,
    };

    // @ts-ignore
    private interval: any;

    public didCreate() {
        this.interval = setInterval(() => {
            this.updateClock();
        }, 200);
    }

    private updateClock() {
        const date = new Date();
        const h = date.getHours();
        this.setState({
            h: h > 12 ? h - 12 : h, m: date.getMinutes(), s: date.getSeconds(),
        });
    }
}
