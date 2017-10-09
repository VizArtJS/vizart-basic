/**
 * Adjusted from: http://blog.graphicsgen.com/2015/03/html5-canvas-rounded-text.html
 *
 * @param ctx
 * @param text
 * @param fontSize
 * @param titleFont
 * @param centerX
 * @param centerY
 * @param radius
 * @param startAngle In degrees, Where the text will be shown. 0 degrees if the top of the circle
 * @param kerning 0 for normal gap between letters. Positive or negative number to expand/compact gap in pixels
 * @param textAlpha
 */
const drawCircularText = (ctx, text, fontSize, titleFont, color, centerX, centerY, radius, startAngle, kerning)=> {
    //Setup letters and positioning
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center'; // Ensure we draw in exact center
    ctx.font = fontSize + "px " + titleFont;
    ctx.fillStyle = color;

    // startAngle = startAngle * (Math.PI / 180); // convert to radians
    text = text.split("").reverse().join(""); // Reverse letters

    //Rotate 50% of total angle for center alignment
    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width;
        startAngle += ((charWid + (j == text.length - 1 ? 0 : kerning)) / radius) / 2;
    }//for j

    ctx.save(); //Save the default state before doing any transformations
    ctx.translate(centerX, centerY); // Move to center
    ctx.rotate(startAngle); //Rotate into final start position

    //Now for the fun bit: draw, rotate, and repeat
    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width / 2; // half letter
        //Rotate half letter
        ctx.rotate(-charWid / radius);
        //Draw the character at "top" or "bottom" depending on inward or outward facing
        ctx.fillText(text[j], 0, -radius);
        //Rotate half letter
        ctx.rotate(-(charWid + kerning) / radius);
    }//for j

    ctx.restore(); //Restore to state as it was before transformations
}//function drawCircularText


export default drawCircularText;