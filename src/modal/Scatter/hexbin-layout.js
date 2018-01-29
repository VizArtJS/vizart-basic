import { range } from 'd3-array';
import { values } from 'd3-collection';

const d3_hexbinAngles = range(0, 2 * Math.PI, Math.PI / 3);
const d3_hexbinX = d => d[0];
const d3_hexbinY = d => d[1];

const hexbinLayout = () => {
  let width = 1,
    height = 1,
    r,
    x = d3_hexbinX,
    y = d3_hexbinY,
    dx,
    dy,
    context = null;

  function hexbin(points) {
    let binsById = {};

    points.forEach(function(point, i) {
      let py = y.call(hexbin, point, i) / dy,
        pj = Math.round(py),
        px = x.call(hexbin, point, i) / dx - (pj & 1 ? 0.5 : 0),
        pi = Math.round(px),
        py1 = py - pj;

      if (Math.abs(py1) * 3 > 1) {
        let px1 = px - pi,
          pi2 = pi + (px < pi ? -1 : 1) / 2,
          pj2 = pj + (py < pj ? -1 : 1),
          px2 = px - pi2,
          py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2)
          (pi = pi2 + (pj & 1 ? 1 : -1) / 2), (pj = pj2);
      }

      let id = pi + '-' + pj,
        bin = binsById[id];
      if (bin) bin.push(point);
      else {
        bin = binsById[id] = [point];
        bin.i = pi;
        bin.j = pj;
        bin.x = (pi + (pj & 1 ? 1 / 2 : 0)) * dx;
        bin.y = pj * dy;
      }
    });

    return values(binsById);
  }

  function hexagon(radius) {
    let x0 = 0,
      y0 = 0;
    return d3_hexbinAngles.map(function(angle) {
      let x1 = Math.sin(angle) * radius,
        y1 = -Math.cos(angle) * radius,
        dx = x1 - x0,
        dy = y1 - y0;
      (x0 = x1), (y0 = y1);
      return [dx, dy];
    });
  }

  hexbin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return hexbin;
  };

  hexbin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return hexbin;
  };

  hexbin.hexagon = function(radius) {
    if (arguments.length < 1) radius = r;

    hexagon(radius).forEach(function(d, i) {
      if (i == 0) {
        context.moveTo(d[0], d[1]);
        context.beginPath();
      } else {
        context.lineTo(d[0], d[1]);
      }
    });
    context.closePath();
    return context;
  };

  hexbin.centers = function() {
    let centers = [];
    for (
      let y = 0, odd = false, j = 0;
      y < height + r;
      y += dy, odd = !odd, ++j
    ) {
      for (let x = odd ? dx / 2 : 0, i = 0; x < width + dx / 2; x += dx, ++i) {
        let center = [x, y];
        center.i = i;
        center.j = j;
        centers.push(center);
      }
    }
    return centers;
  };

  hexbin.mesh = function() {
    let fragment = hexagon(r)
      .slice(0, 4)
      .join('l');
    return hexbin
      .centers()
      .map(function(p) {
        return 'M' + p + 'm' + fragment;
      })
      .join('');
  };

  hexbin.size = function(_) {
    if (!arguments.length) return [width, height];
    (width = +_[0]), (height = +_[1]);
    return hexbin;
  };

  hexbin.radius = function(_) {
    if (!arguments.length) return r;
    r = +_;
    dx = r * 2 * Math.sin(Math.PI / 3);
    dy = r * 1.5;
    return hexbin;
  };

  hexbin.context = function(_) {
    if (!arguments.length) return context;
    context = _;
    return hexbin;
  };

  return hexbin.radius(1);
};

export default hexbinLayout;
