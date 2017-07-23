import { Stacks } from '../../data';
import { DefaultCategoricalColor } from 'vizart-core';

const CoronaOptions = {
    chart: {
        type: 'corona'
    },
    color: DefaultCategoricalColor,
    plots: {
        levels: 0,				//How many levels or inner circles should there be drawn
        maxValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        innerRadiusRatio: 0.4,
        showDots: true,
        sortArea: true, // show smallest area on top
        stackLayout: true, // stack areas
        stackMethod: Stacks.Zero,
        isArea: true	//If true the area and stroke will follow a round path (cardinal-closed),
    }
};


const RadarOptions = {
    chart: {
        type: 'radar'
    },
    color: DefaultCategoricalColor,
    plots: {
        levels: 0,				//How many levels or inner circles should there be drawn
        maxValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        innerRadiusRatio: 0.4,
        showDots: false,
        sortArea: true, // show smallest area on top
        stackLayout: true, // stack areas
        stackMethod: Stacks.Zero,
        isArea: false	//If true the area and stroke will follow a round path (cardinal-closed),
    }
};

export {
    CoronaOptions,
    RadarOptions
}