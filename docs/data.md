# Incorporating data

## Accessing Data

The easiest way to pass data to a template is putting it in the `data` option when calling `visualize`.
The data option should be an object, and its content is available for direct use in the template. For example, if we have `data1` and `data2` in the data option:

```js
Oviz.visualize({
    template,
    data: {
        data1: [1, 2, 3, 4],
        data2: { foo: "bar" },
    }
})
```

Then `data1` and `data2` can be accessed in the template:

```bvt
Component {
    @for item in data1 {
        // ...
    }
    Text {
        text = data2.foo
    }
}
```

## Data Utilities

#### @min, @max and @minmax

Oviz provides some utility helpers for better data handling.

`@min`, `@max`, and `@minmax` return the minimum value, the maximum value, or both of them in an array.
The first argument should be the array; the second one, if provided, should be a _key_ as a string or an _accessor_, which should indicate the desired value used to calculate the minimum/maximum.

```bvt
@min(data, "key")
@min(data, d => d.a + d.b)
```

#### @groupBy

`@groupBy` groups an array using the specified key.

```bvt
@groupBy(data, "key")
```

## Mixins

Prop **mixins** can be achieved using the `@props` command. If you have a set of common props that should be applied to multiple elements, instead of writing them repeatedly in each element's block, you can _predefine them as data_ and use `@props` to avoid a bloated template.

```js
const p = {
    set1: {
        fill: "#faa",
        stroke: "#a52",
    },
    set2: // ...
};

Oviz.visualize({
    data: {
        p,
    },
});
```

```bvt
Component {
    @let set3 = {
        fill: "#afa", stroke: "#5a2"
    }

    Rect { @props p.set1 }
    Circle { @props p.set1; r = 4}
    Rect { @props p.set2 }
    Rect { @props set3 }
}
```

It's also possible to have a function that receives arguments and generates props dynamically.
In the following example, the function `c` generates fill and stroke colors for the rectangle based on a base color.

```js
function c(baseColor) {
    const fill = Color.literal(baseColor);
    const stroke = fill.darken(20);
    return {
        fill, stroke,
        width: 40, height: 40,
    };
}
```

<div class="demo" data-height="100">
Component {
    Rect { @props c("#fbc"); x = 0 }
    Rect { @props c("#bfc"); x = 60 }
    Rect { @props c("#cbf"); x = 120 }
}
</div>
<div class="bvd-code">
(function() {
    function colorProps(baseColor) {
        const fill = Crux.color.Color.literal(baseColor);
        const stroke = fill.darken(20);
        return {
            fill: fill.string, stroke: stroke.string,
            width: 40, height: 40,
        };
    }
    return {
        data: { c: colorProps },
    };
})()
</div>
