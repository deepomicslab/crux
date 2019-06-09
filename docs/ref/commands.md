# Commands

### Explaination of identifiers

- **`str`**, identifiers ends with `_name`: a string that can only start with letters and contain letters, numbers and underlines.
- **`expr`**: a JavaScript expression.
- **`simple_expr`**: a JavaScript expression. However it can only contain letters, numbers, underlines, `[`, `]`, `(`, `)` and `"`.
- **`block`**: a block.

## @let

> @let `name:str` = `value:expr`

Declare a new variable with `name`. It will be available within the current block.

It is possible to span multiple lines as long as it starts and ends with bracket (`(`, `[`, `{`) pairs.

`@let` commands will always be elevated to the top of the block.

## @expr

> @expr `expression:expr`

Execute a JavaScript expression.

`@expr` commands will always be elevated to the top of the block.

## @if

> @if `condition:expr` `{ block }`

Return elements in the block if the expression evaluates to true, and skip all following `@elsif` or `@else` blocks.

## @elsif

> @elsif `condition:expr` `{ block }`

Return elements in the block if the expression evaluates to true, and skip all following `@elsif` or `@else` blocks.

Can only be placed immediately after a `@if` or `@eislf` command block.

## @else

> @else `{ block }`

Return elements in the block.

Can only be placed immediately after an `@if` or `@eislf` command block.

## @for

> @for `item:str` in `data:simple_expr` `{ block }`

> @for (`item:str`, `index:index`) in `data:simple_expr` `{ block }`

## @yield

> @yield `name:str` [with `data:simple_expr`] [then `fn:str`] [default `{ block }`]

Return named children with `name`.
If a named child with such name is not found in this component:
- If `name` is `children`, return children supplied for this component.
- Otherwise if a `block` is supplied, return the content of the block.
- Otherwise, return nothing.

If `data` is specified, pass the data to named children.

If `fn` is specified, pass the element definitions to the function named `fn`.
It is possible to add additional props to those element definitions.

## @props

> @props `prop:simple_expr`

Insert keys and values in `prop` as prop names and values at the current position.
