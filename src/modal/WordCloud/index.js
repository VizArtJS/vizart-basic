import { AbstractBasicCartesianChart } from '../../base';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { default as cloud } from 'd3-cloud';

import createCartesianOpt from '../../options/createCartesianOpt';


const SPIRAL = {
    ARCHIMEDIAN : 'archimedean',
    REECANGULAR :  'rectangular'
};

const DefaultOptions = {
    chart: {
        type: 'word_cloud',
        margin: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }
    },

    plots: {
        opacity: 1,
        padding: 5,
        rotates: 0,
        fontSizeMax: 100,
        fontSizeMin: 10,
        fontFamily: 'Arial',
        spiral: SPIRAL.REECANGULAR
    }
};

const drawCanvas = (context, layout, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    for (let d of layout) {
        context.fillStyle = d.c;
        context.textAlign = "center";
        context.font=`${d.size}px ${opt.plots.fontFamily}`;
        context.globalAlpha = opt.plots.opacity;
        context.fillText(d.text, d.x, d.y);
    }
    context.restore();
}

const TimeInterval = 10;

class WordCloud extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate(){
        const layout = cloud().timeInterval(TimeInterval);

        const sizeScale = scaleLinear()
            .domain(extent(this._data, d=> this._getMetricVal(d)))
            .range([this._options.plots.fontSizeMin, this._options.plots.fontSizeMax]);

        this._frontContext.clearRect(0, 0, this._frontContext.canvas.width, this._frontContext.canvas.height);

        layout
            .stop()
            .words(this._data.map(d=> {
                const t = d;
                t.c = this._c(d);
                return t;
            }))
            .padding(this._options.plots.padding)
            .spiral(this._options.plots.spiral)
            .size([this._options.chart.innerWidth, this._options.chart.innerHeight])
            .text(this._getDimensionVal)
            .rotate(this._options.plots.rotates)
            .fontSize(d=> sizeScale(this._getMetricVal(d)))
            .on("end", ()=>{
                drawCanvas(this._frontContext, this._data, this._options)
            });

        layout.start();

    }

    createOptions(_userOptions) {
        return createCartesianOpt(DefaultOptions, _userOptions);
    }

    archimedean() {
        this._options.plots.spiral = SPIRAL.ARCHIMEDIAN;
        this.update();
    }

    rectangular() {
        this._options.plots.spiral = SPIRAL.REECANGULAR;
        this.update();
    }
}


export default WordCloud;