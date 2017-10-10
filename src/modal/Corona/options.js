import { Stacks } from '../../data';

const CoronaOptions = {
    chart: {
        type: 'corona',
        margin: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }
    },
    plots: {
        levels: 0,				//How many levels or inner circles should there be drawn
        levelColor: '#CDCDCD',
        levelLabelColor: '#737373',
        levelLabelPosition: 'top', //'top', 'bottom', 'right'
        levelLabel: null,

        axisLabel: null,
        axisLabelColor:'#737373',
        axisLabelOffset: 10, //How much farther than the radius of the outer circle should the labels be placed

        highlightStrokeColor: '#000000',
        highlightNodeColor: '#F03E1E',
        highlightLabelColor: '#000000',

        strokeOpacity: 0,
        strokeWidth: 4, 		//The width of the stroke around each blob

        areaOpacity: 0.35, 	//The opacity of the area of the blob,
        gradientArea: true,

        drawBoundary: true,
        boundaryOffset: 10,
        boundaryOpacity: 0.5,
        boundaryGradient: ['white', '#eb3ba6'],

        innerRadiusRatio: 0.4,
        outerRadiusMargin: 60,

        stackLayout: true, // stack areas
        stackMethod: Stacks.Zero,
        isArea: true	//If true the area and stroke will follow a round path (cardinal-closed),
    }
};



export default CoronaOptions;