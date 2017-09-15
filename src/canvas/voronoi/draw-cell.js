const drawCell = (context, cell)=> {
    if (!cell) return false;
    context.moveTo(cell[0][0], cell[0][1]);
    for (let j = 1, m = cell.length; j < m; ++j) {
        context.lineTo(cell[j][0], cell[j][1]);
    }
    context.closePath();
    return true;
}

export default drawCell;