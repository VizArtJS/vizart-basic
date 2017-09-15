/**
 * Find the nodes within the specified rectangle.
 *
 * @param quadtree
 * @param x0
 * @param y0
 * @param x3
 * @param y3
 */
const search =(quadtree, x0, y0, x3, y3)=> {
    quadtree.visit(function(node, x1, y1, x2, y2) {
        if (!node.length) {
            do {
                var d = node.data;
                d.scanned = true;
                d.selected = (d[0] >= x0) && (d[0] < x3) && (d[1] >= y0) && (d[1] < y3);
            } while (node = node.next);
        }
        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
}

export default search;