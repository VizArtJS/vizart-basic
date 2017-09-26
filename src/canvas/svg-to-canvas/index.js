import svgPathToCommands from './svg-path-to-commands';

const drawSvgPath = (ctx, path)=> {
    ctx.save();
    ctx.beginPath();
    let lastPos = [ 0, 0 ];
    let pointOne, pointTwo;

    const commandList = svgPathToCommands(path);

    for (let command of commandList) {
        if ((command.marker === 'z') || (command.marker === 'Z')) {
            lastPos = [ 0, 0 ];
            ctx.closePath();
        } else if (command.marker === 'm') {
            lastPos = [ lastPos[0] + command.values[0], lastPos[1] + command.values[1] ];
            ctx.moveTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'l') {
            lastPos = [ lastPos[0] + command.values[0], lastPos[1] + command.values[1] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'h') {
            lastPos = [ lastPos[0] + command.values[0], lastPos[1] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'v') {
            lastPos = [ lastPos[0], lastPos[1] + command.values[0] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'c') {
            pointOne = [ lastPos[0] + command.values[0],
                lastPos[1] + command.values[1] ];
            pointTwo = [ lastPos[0] + command.values[2],
                lastPos[1] + command.values[3] ];
            lastPos  = [ lastPos[0] + command.values[4],
                lastPos[1] + command.values[5] ];
            ctx.bezierCurveTo(
                pointOne[0], pointOne[1],
                pointTwo[0], pointTwo[1],
                lastPos[0], lastPos[1]);
        } else if (command.marker === 'M') {
            lastPos = [ command.values[0], command.values[1] ];
            ctx.moveTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'L') {
            lastPos = [ command.values[0], lastPos[1] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'H') {
            lastPos = [ command.values[0], lastPos[1] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'V') {
            lastPos = [ lastPos[0], command.values[0] ];
            ctx.lineTo(lastPos[0], lastPos[1]);
        } else if (command.marker === 'C') {
            pointOne = [ command.values[0],
                command.values[1] ];
            pointTwo = [ command.values[2],
                command.values[3] ];
            lastPos  = [ command.values[4],
                command.values[5] ];
            ctx.bezierCurveTo(
                pointOne[0], pointOne[1],
                pointTwo[0], pointTwo[1],
                lastPos[0], lastPos[1]);
        }
        ctx.stroke();
        ctx.restore();
    }
}

export default drawSvgPath;