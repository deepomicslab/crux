# Usage in browser

A `visualize` method is exported as the entrance.

Call this method somewhere in the page:

```js
Crux.visualize({
    el: "#canvas",
    template,
})
```

`el` is the target element to be attached. All content inside this element will be cleared before rendering.
It can be either a selector string or an HTML element.

`template` is the template string. When used with `visualize`, the root component should be wrapped in an `svg`
or `canvas` block:

```
svg {
    width = auto
    height = 400
    Component {
        // ...
    }
}
```

`svg` specifies the rendering method to be SVG rather than canvas. `width` and `height` defines the size of
the visualization. `auto` is a special value, which equals to the container size. By default `width` and
`height` are all `auto`.
