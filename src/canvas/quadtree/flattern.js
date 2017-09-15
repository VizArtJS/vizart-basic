/**
 * Collapse the quadtree into an array of rectangles.
 *
 * @param quadtree
 * @returns {Array}
 */
const flattenQuadtree = quadtree=> {
    let nodes = [];
    quadtree.visit((node, x0, y0, x1, y1)=> {
        node.x0 = x0, node.y0 = y0;
        node.x1 = x1, node.y1 = y1;
        nodes.push(node);
    });
    return nodes;
}

export default flattenQuadtree;