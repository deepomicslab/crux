# Delegated Props

We have mentioned the _delated props_ mechanism in part one of this tutorial.
Supporting delegated props is amazingly easy for custom components: it simply leverages the power of the `@props` command.

The critical point is that Oviz makes delegated props available though the special object `prop.opt`.

Suppose that we are going to write a component `TwoRects`, which renders two rectangles with the same height and the same width, designated by the user. However, the user should also be able to customize the appearance of each rectangle individually.

We provide delegated props for the two rectangles under the name of `rect1` and `rect2`. 

```js
class TwoRects extends Component {
    render() {
        return this.t`Component {
            Rect {
                @props prop.opt.rect1
                width = prop.rectWidth
                height = prop.rectHeight
            }
            Rect {
                @props prop.opt.rect2
                x = prop.rectWidth +2
                width = prop.rectWidth
                height = prop.rectHeight
            }
        }`;
    }
}
```
<div class="demo" data-height="200">
TwoRects {
    x = 10
    y = 10
    rectWidth = 100
    rectHeight = 120
    rect1.fill = "red"
    rect2.fill = "blue"
    rect2.stroke = "#f5a"
    rect2.strokeWidth = 2
}
</div>
<div class="bvd-code">
class TwoRects extends Crux.Component {
}
TwoRects.prototype.render = Crux.t`
Component {
    Rect {
        @props prop.opt.rect1
        width = prop.rectWidth
        height = prop.rectHeight
    }
    Rect {
        @props prop.opt.rect2
        x = prop.rectWidth +2
        width = prop.rectWidth
        height = prop.rectHeight
    }
}
`
TwoRects
</div>

Note that the position of the `@props` command matters: props declared later will always overwrite those declared before.
Therefore, in the above example, even if the user designates the sizes of the `Rect`s, such as writing `rect2.width = 200`,
they will be ignored because the line `width = prop.rectWidth`, which appears later, takes precedence.

Based on the actual requirements, you can adjust the position of the `@prop` command to fit your needs.