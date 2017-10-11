import midAngle from './mid-angle';

const getLinePosition = (centroid, d2, offset = 30)=> {
    let pos = [];
    const angle = midAngle(d2) / Math.PI * 180;

    pos[0] = angle > 180 ? centroid[0] - offset : centroid[0] + offset;
    pos[1] = centroid[1];

    if (angle <= 0 || angle >= 360) {
        pos[1] -= offset;
    } else if (angle == 180) {
        pos[1] += offset;
    } else if (angle <= 30) {
        pos[1] -= (30 - angle) / 30 * offset;
    } else if (angle >= 150) {
        if (angle < 180) {
            pos[1] += (angle - 150) / 30 * offset;
        } else if (angle <= 210) {
            pos[1] += (210 - angle) / 30 * offset;
        } else if (angle >= 330) {
            pos[1] -= (angle - 330) / 30 * offset;
        }
    }
    return pos;
}

export default getLinePosition;