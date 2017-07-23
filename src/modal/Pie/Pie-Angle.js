let midAngle = function(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

let getLinePosition = function(_outerArc, d2) {
    let pos = _outerArc.centroid(d2);
    let angle = midAngle(d2) / Math.PI * 180;

    if (angle <= 0 || angle >= 360) {
        pos[1] -= 8;
    } else if (angle == 180) {
        pos[1] += 8;
    } else if (angle <= 30) {
        pos[1] -= (30 - angle) / 30 * 8;
    } else if (angle >= 150) {
        if (angle < 180) {
            pos[1] += (angle - 150) / 30 * 8;
        } else if (angle <= 210) {
            pos[1] += (210 - angle) / 30 * 8;
        } else if (angle >= 330) {
            pos[1] -= (angle - 330) / 30 * 8;
        }
    }
    return pos;
}

let getLabelPosition = function(_outerArc, d2) {
    let pos = _outerArc.centroid(d2);
    let angle = midAngle(d2) / Math.PI * 180;

    if (angle <= 0 || angle >= 360) {
        pos[1] -= 17; //vertical
    } else if (angle == 180) {
        pos[1] += 20; //vertical
    } else if (angle < 180) {
        pos[0] += 3;
        if (angle <= 30) {
            pos[1] -= (30 - angle) / 30 * 17;
        } else if (angle >= 150) {
            pos[1] += (angle - 150) / 30 * 20;
        }
    } else {
        pos[0] -= 3;
        if (angle <= 210) {
            pos[1] += (210 - angle) / 30 * 20;
        } else if (angle >= 330) {
            pos[1] -= (angle - 330) / 30 * 17;
        }
    }

    return pos;
}

export {
    midAngle,
    getLinePosition,
    getLabelPosition
}