# Data Loading and Binding 

(for internal use)

Besides directly providing the well-loaded data objects in `data` option, you can also use `DataLoader` to load data, process data* and bind data to the visualizer. 

To create the `DataLoader`, all you need do is to describe the `DataSource`s and provide a dictionary of data sources options to the visualizer, then Oviz will create the `DataLoader` and load data for you.

!>Please be cautious that Oviz is for visualization only. Complex data processing should never be done in Oviz.

```js
Oviz.visualize({el, template, 
    loadData:{
        dataSource1: // the dataSource name
            { // the dataSource options
                type: "text",
                content: "hello oviz ovo",
                loaded(d) {
                    console.log(d);
                    return d.concat("/n I love oviz"),
                }
            },
        ...,
    }, ...})
```


## Loading Approach

### Load By Raw Text Content

> **content**: `string`

You can load the text content directly by providing the `content` option.

```js
const loadData = {
    DataLoadedByContent: {
        type: "text",
        content: `Hello Oviz!`,
        loaded(d) {
            console.log(d);
            // console logged "Hello Oviz!";
        }
    }    
}
```
#### Load By Api Call

>**url**: `string|((dl: DataLoader<T>) => string)`

You can use an api call to get the data by providing the `url` option.

### Load By Files

>**fileKey**: `string`

You can also config your own file systems in your platform by preparing the chosen_file_paths api.

Oviz will check the `window.gon`, and if Oviz find the `window.gon.chosen_file_paths` is presented, it will make a call to the url.
reseponse format:
```json
{
    "fileKey1": {
        "url": "data/fileKey1/file.txt",
        "metaData": {},
    },
    "fileKeyMultiple": [
        {
            "url": "data/fileKeyMultiple/file1.txt",
            "metaData": {}
        },
        {
            "url": "data/fileKeyMultiple/file2.txt",
            "metaData": {}
        },
        ...
    ],
    ...
}
```

## Common Method Options

> **shouldLoad**: `(this: DataLoader) => boolean`

Defines the function that decides whether the data source should be loaded.

> **loader**: `DataSourceLoader<T>`

Defines how the data source should be loaded. The default value is undefined.

> **loaded**: `DataSourceCallback<T, U>`

Defines the data processing after the data source is loaded. The default value is undefined.

```js
const loadData = {
    dataT: {
        loaded(d) {
            console.log(d);
            //  print the data loaded
            d = ["a"];
            return d; // set dataT to ["a"]
        }
    }
}
```


## Common Attribute Options

> **optional**: `boolean`

Defines whether the data is mandatory for visualizing. The default value is `false`.

> **multiple**: `boolean`

Defines whether the data can have multiple files to load. The default value is `false`.

> **dependsOn**: `string[]`

Defines the data depends on the provided list of data, i.e. the data loading will not start until all the depending data sources are loaded. The default value is `null`. 

```js
const loadData =  {
    data0: {...},
    data1: {
        dependsOn: ["data0"],
    }
}
```

> **type**: `DataSourceType | string`
The type of the data file, e.g. `text` or `csv`. By default, the data will be loaded as `text`.

## DataSourceType

> `DataSourceType.TEXT | "text"`

> `DataSourceType.JSON | "json"`

> `DataSourceType.CSV | "csv"`

> `DataSourceType.TSV | "tsv"`

> `DataSourceType.NEWICK | "newick"`

The data to load is [newick](https://en.wikipedia.org/wiki/Newick_format) file. The loaded data object will be an node object.
```js
[
    {
        name: "rootNode"
        length: 0,
        children: {
            [
                name: "level1NodeA",
                length: 1,
                children: ...,
            ],
            ...
        }
    },
]
```


## DSV DataSource Options

Oviz implements d3-dsv to parse DSV data into an array of dictionaries. [d3-dsv](https://github.com/d3/d3-dsv#dsv_parseRows)

You can define the row parsing by providing the `dsvRowDef` or `dsvRowParser`.

If the row parsing is undefined, the field values will be loaded as `string` by default.

>**dsvRowDef**: `{ [name: string]: DSVRowDef }`

>**dsvRowParser**: `(rawRow: d3.DSVRowString | string[], index: number, columns: string[]) => any`

>**dsvHasHeader**: `boolean`

Indicates whether the dsv data source has a header row or not. The default value is true. When the `dsvHasHeader` is `false`, you can provide the row parsing to.

###
    IMAGE = "image",
