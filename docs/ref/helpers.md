# Helpers

Helpers can be used like normal JavaScript functions, and can be nested, for example

```
@geo(100, @scaledX(data))
```

## @geo

> @geo(`percentage:number`, `offset?:number`)

Return the geometry value `percentage`% + `offset`.

## @anchor

> @anchor(`a1:string`, `a2:string`)

**Can only be used with the `anchor` prop.**

`a1` and `a2` can be one of:

- `"top"` or `"t"`
- `"middle"` or `"m"`
- `"bottom"` or `"b"`
- `"left"` or `"l"`
- `"center"` or `"c"`
- `"right"` or `"r"`

## @clip

> @clip(`type:string`, `r?:number`)

**Can only be used with the `clip` prop.**

`type` can be one of the following values:

- `"bound"`: clip to the bound of this compnent.

`r` is the border radius of the clipping rect.

## @rotate

> @rotate(`value:number`, `unit?:string`)

**Can only be used with the `rotation` prop.**

`unit` can be `"rad"` or `"deg"`. The default value is `"deg"`.

## @scaled()

> @scaled(`value:number|number[[`, `horizontal:boolean`)

`value` is the data to be scaled. If `value` is an array, all elements in it will be scaled.

`horizontal` controls the X (`true`) or Y (`false`) direction.

## @scaledX()

> @scaledX(`value:number`)

Equivalent to `@scaled(value, true)`.

## @scaledY()

> @scaledY(`value:number`)

Equivalent to `@scaled(value, false)`.

## @scaleLinear()

> @scaleLinear(`domainMin?:number`, `domainMax?:number`, `rangeMin?:number`, `rangeMax?:number`)

**Can only be used with `xScale` or `yScale` prop.**

Create a linear scale.

If range or domain is not specified, width or height
(based on whether it is supplied to `xScale` or `yScale`)
of the current component will be used as default.
