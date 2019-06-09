# Getting Started

## Setup

Clone the project:

```
git@gitlab.deepomics.org:lhc/crux.git
```

`parcel` is required for now:

```
yarn global add parcel-bundler
```

then install dependencies under project root path:

```
yarn install
```

To start the development server:

```
parcel index.html
```

## VSCode Plugin

A VSCode plugin is provided to enable the syntax highlight for templates.
[download it from here](https://gitlab.deepomics.org/lhc/bvt-vscode/tags).

Install the vsix file through the plugin menu - Install from VSIX.

There are two ways to enable syntax highlight in JavaScript/TypeScript.
When using the `template` tag (we will cover this later),
the string will be treated as a template automatically.

```js
const t = template`
Component {
    // ...
}
`;
```

For normal strings, add `//bvt` at the start of the strings:

```js
const t = `//bvt
Component {
    // ...
}
`
```
