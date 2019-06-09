# Visualizer

Each visualization graph is created and managed by a `Visualizer`.

Typically you do not create the `Visualizer` manually. The `visualize` method will do it for you,
by accepting a set of options and returning a `Visualizer` object:

```js
Crux.visualize({
    el, template, // ...
})
```

## Options

It is possible to supply either a **template string** or a **root component** to the visualizer.

### Common options

> **el**: `string | HTMLElement`

The container element for the visualization. It can either be a selector or an HTML element.
Content in this element will be cleared and an `<svg>` or `<canvas>` element will be placed inside.


### Options when using a template string
> **template**: `string`

The template string. It should have an `svg` or `canvas` root block.

Valid props in the root block are `width` and `height`.
The values for them can be a fixed number or `auto`, which represents the container's width and height on the page.

```
svg {
    width: auto
    height: 500
    Component {
        // ...
    }
}
```

> **components**: `Record<string, typeof Component>`

Custom components referenced in this template. This is the same as `Component.components`.

> **data**: `Record<string, any>`

Data names and values referenced in this template.

### Options when using a root component

> **root**: `Component`

The root component.

> **props**: `Record<string, any>`

Props for the root component.

> **width**: `number | "auto"`

> **height**: `number | "auto"`

Width and height for the `<svg>` or `<canvas>` element.
This is equivalent to the options in root `svg` or `canvas` block if you are using a template,
rather than the size of the root element, which you can specify in its props.

> **renderer**: `"canvas" | "svg"`

The renderer type.

## Properties

> **container**

The container HTML element.

> **root**

The root component.

> **size**

Size of the container element.

## Methods

> **run()**

Run or re-run the visualizer. This will render the root component again.

> **appendDef()**

Append a new element in SVG's `<def>` element. Do not use this method directly.

```js
appendDef(id: string, tag: string, attrs: Record<string, string> = {}, content: string = "")
```