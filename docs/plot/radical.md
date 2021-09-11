# Radical Charts

## Pie

### Default Pie

### Pie chart props

>**startAngle**: number;

>**endAngle**: number;

>**innerRadius**: number;

>**data**: PieChartData;

>**totalValue**: number;

>**colorScheme**: any;

### Overwrite using delegate props

### Overwrite using sockets

You can use sockets to completely overwrite the bars. Bar chart provide the following 2 sockets: 
1. `:children(d)`, the socket for the pie arc, the default socket.
2. `:label(d)`, the socket for the pie label.
3. `:background`, the socket for the chart background.
4. `:legend(legendData)`, the socket for the legend.

```typescript
interface pieSocketData {
    index: number,
    data: any,
    start: number,
    end: number,
    color: string,
}
```

```typescript
interface legendData {
    label: string,
    fill: string,
}
```
## Radar
