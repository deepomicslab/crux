# Elements and Components

Primitive Elements extends `BaseElement` directly, while all components inherit from `Component`.

- `BaseElement`
    - → Primitive Elements
    - → `Component`
        - → Components

## BaseElement

### uid

> uid: `number`

An ID which is unique in the visualizer.

### $parent

> $parent: `Component`

The containing component of this element.

### $v

> $v: `Visualizer`

The visualizer.

### prop

> prop: `Record<string, any>`

Props. Readonly.

### state

> state: `Record<string, any>`

The state object. Readonly.

### stage

> stage: `string`

The current stage.

### propNameForInitializer()

> `static propNameForInitializer(): string`

If current element supports a initializer, returns the prop name for it. For example, `Text` returns `"text"`.

### defaultProp()

> `defaultProp(): Partial<Option>`

Return the default props for this element. If its parent's default props should be inherited,
simply call it on `super`:

```js
return {
    ...super.defaultProps(),
    // ...
}
```

### setState()

> `setState(states: Record<any>)`

Set states.

### draw()

> `draw()`

Triggers rendering of the element.

### svgTagName()

> `svgTagName(): string`

**Required for primitive elements.**

Returns the SVG tag name. For example, `Circle` returns `"circle"`.

### svgAttrs()

> `svgAttrs(): Record<string, string | number | boolean>`

**Required for primitive elements.**

Returns the SVG attributes for this element.

### svgTextContent()

> `svgTextContent(): string`

**Required for primitive elements.**

Returns the text content, if any. Otherwise return `null`.

### geometryProps()

> `geometryProps(): { h: string[], v: string[] }`

Returns the props that represents geometry value, for example `r` in `Circle`, and `x1` `x2` in `Line`.

Only props returned in this method will be calculated (relative values, such as 50%, will be expanded to real value in pixel) during layout.

## Component

### render()

The render function.

### getScale()

> `getScale(horizontal: boolean): any`

Returns the scale object for the specified direction.
`null` is returned if there is no scale in this direction.
