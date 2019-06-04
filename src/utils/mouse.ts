export default function(node: SVGGraphicsElement, event: MouseEvent): [number, number] {
    const svg: SVGSVGElement = node.ownerSVGElement || node as any;

    if (svg.createSVGPoint) {
        let point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
    }

    const rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
}
