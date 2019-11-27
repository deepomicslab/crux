# Colors and Themes

## The Color Class

Colors in Oviz are represented by a `Color` class.
Apart from being used internally, the `Color` class can also serve as a convenient tool for converting and manipulating colors.

A new `Color` instance can be created from HSL values, RGB values, or a string literal.

```js
const Color = Oviz.color.Color;

const green  = Color.hsl(100, 50, 60);
const orange = Color.rgb(255, 158, 79);
const yellow = Color.literal("#ff4");
const blue   = Color.literal("blue");
```

Once you get the `Color` instance, you can get the HSL, RGB or hex string representation of the color:

```js
const color = Color.literal("#abc");

color.rgb     // [170, 187, 204]
color.hsl     // [210, 25, 73]
color.string  // "#AABBCC
```

It's also possible to manipulate the color and get a new color instance:

```js
color.darken(5);
color.lighten(5);
color.saturate(5);
color.desaturate(5);
color.shiftHue(5);
```

All parameters range from 0 to 100 for those methods.

## Themes

Oviz has an extendable theming system. A **theme** comprises a set of named _colors_ and _color schemes_.
Named colors can be referenced by their name in the template, while some of them are also used as default fill or stroke color for components.
Color schemes are simply arrays of colors that can be either used as primary colors for individual components or mapped to data categories.

The following example uses the default color scheme of the default theme:

<div class="demo no-editor" data-height="100">
Component {
    Line {
        x1 = 50; x2 = 450; y1 = 50; y2 = 50; strokeWidth = 4
    }
    @for i in 3 {
        Circle.centered {
            x = i * 100 + 150; y = 50; fill = @color(i); r = 20
        }
    }
    Text("Hello world") {
        x = 500; y = 50; anchor = @anchor("left", "middle"); fontSize = 28
    }
}
</div>

### Defining themes

A theme can be defined using `Oviz.use.theme`, and a minimal theme definition looks like this:

```js
Oviz.use.theme("myTheme", {
    colors: {
        theme: "#faa",
        text: "#04f",
        line: "#999",
    },
    schemes: {
        main: ["$theme", "#afa", "#aaf"],
    }
});
```

It defines a theme called "myTheme" and makes it available globally.

As said above, several color names are required by Oviz internally:
- `theme` is the default fill color for shapes such as `Rect`, `Circle`, and `Path`;
- `text` is the default text color; and
- `line` controls the stroke color for all lines.

A color scheme named `main` is the default color scheme. It's also required by some internal components such as `GroupedBars`.
Therefore, those names must appear in your theme definition.

In the definitions for color schemes, you can reference a color name using a string starting with `$`, such as `$theme`.

When we apply this theme to the example above, it changes its appearance without modifying any part of the template.

<div class="demo no-editor" data-height="100">
Component {
    Line {
        x1 = 50; x2 = 450; y1 = 50; y2 = 50; strokeWidth = 4
    }
    @for i in 3 {
        Circle.centered {
            x = i * 100 + 150; y = 50; fill = @color(i); r = 20
        }
    }
    Text("Hello world") {
        x = 500; y = 50; anchor = @anchor("left", "middle"); fontSize = 28
    }
}
</div>
<div class="bvd-code">
(function() {
Crux.use.theme("myTheme", {
    colors: {
        theme: "#faa",
        text: "#04f",
        line: "#999",
    },
    schemes: {
        main: ["$theme", "#afa", "#aaf"],
    }
});
return { theme: "myTheme" };
})()
</div>

### Default themes

By default, Oviz ships with two themes, `light` and `dark`, which are intended to be used with light and dark backgrounds, respectively.
Each of them contains a default color scheme (i.e., the color scheme named `main`) of 12 colors, as shown in the following example.

<div class="demo no-editor" data-height="200">
Component {
    Rect {
        width = 800; height = 100; fill = "#fff"
    }
    @for i in 12 {
        Circle.centered {
            x = i * 50 + 80; y = 50; fill = @themeColor("light", i); r = 15
        }
    }
    Text("light") {
        x = 100%-30; y = 20; anchor = @anchor("right", "top")
    }
    Rect {
        y = 100; width = 800; height = 100; fill = "#333638"
    }
    @for i in 12 {
        Circle.centered {
            x = i * 50 + 80; y = 150; fill = @themeColor("dark", i); r = 15
        }
    }
    Text("dark") {
        x = 100%-30; y = 120; anchor = @anchor("right", "top"); fill = @themeColor("dark", "text")
    }
}
</div>

Text and line colors are black in the `light` theme and white in the `dark` theme.

### Extending themes

If you only need to change a small part of an existing theme, you can also _extend_ a theme.
Adding the `extends` key with a theme name to indicate that the current theme is an extension of a base theme.
All colors and schemes from the base theme are available in the definition in the new theme, so you can reference colors using `$` from the base theme.
If the current theme redefines a color or a scheme, it overwrites the one in the base theme.

You can also _extend a color scheme_ when extending a theme.
By providing a `transform` function that receives a `Color` and returns a `Color`, you can modify each color in the base scheme and return a slightly changed one.

```js
Oviz.use.theme("myTheme", {
    extends: "light",
    colors: {
        primary: "#66ccff",
    },
    schemes: {
        myScheme: ["$primary", "#aaa", "#bbb"],
        m2: {
            extends: "m1",
            transform: color => color.lighten(15),
        }
    }
});
```

### Using themes

Using a theme other than the default one is easy.
Depending on how your code looks like, you can specify the theme either in the `visualize` method or in the template.

```js
Oviz.visualize({
    theme: "myTheme",
});
```

```bvt
svg {
    theme = "myTheme"
    Component {
        // ...
    }
}
```

## Using Colors

Using theme colors rather than hard-coded literals can help your template adapt to multiple themes.
To reference colors in the current theme, use the `@color` helper.

```bvt
Rect {
    fill = @color(1)
}
Text {
    fill = @color("theme")
}
```

The `@color` helper can accept a color name as string, or a number indicating using a color from the default color scheme: 0 means the first color in the main color scheme, 1 is the second one, and so on.

## Color Mapping

When you have a set of data categories and need to assign a color for each of them, another helper `@colorMap` would be useful.
It creates a mapping between a series of keys and colors, and you can get the corresponding color by a key.

The first argument of `@colorMap` represents the categories. It can be a number, indicating the count of the categories, or an array of string, specifying each key explicitly.

The second argument is the color scheme to be used. If omitted, it uses the default color scheme of the current theme; and you can also designate a scheme name.
If you already have an array of predefined colors, you can also use it directly.

```bvt
@colorMap(10)
@colorMap(["a", "b", "c"])
@colorMap(10, "myScheme")
@colorMap(10, ["#aaa", "#bbb", "#ccc"])
```

When a color mapping is created, the `get()` method would return the corresponding color.

```bvt
@let map = @colorMap(10)
@for i in 10 {
    Rect {
        fill = map.get(i)
    }
}
```