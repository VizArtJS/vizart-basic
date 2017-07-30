# vizart-basic

* [Demo](https://vizartjs.github.io/demo.html) quick reference with source code
* [Documentation](https://github.com/VizArtJS/vizart-basic/wiki) Full option spec



## Usage:

1. Install

```
npm install vizart-basic --save
```

2. ES6 Usage

```
import 'vizart-basic/dist/vizart-basic.css';
import { Bar } from 'vizart-basic';

const _bar = new Bar(_domId, _opt)....
```

## Three steps to use a chart
1. initialize a chart with domId and declarative options
```
let _opt = {
  ...
};
const _chart = new Chord('#chart', _opt)
```
You only need to provide essential options. [Demo](https://vizartjs.github.io/demo.html) is a good place to check essential options for all charts. You may check up Documentation of each component for full option spec so as to control more chart behaviours.

2. Render a chart with data
```
_chart.render(data) // this should be called only once
```
3. Change a chart on the fly
```
let _opt = _chart.options();
_opt.plots.opacityArea = o.4
_chart.options(_opt);

_chart.update();
```


## Development
1. Clone repository
2. Run commands
```
npm install         // install dependencies
npm run dev         // view demos in web browser at localhost:3005
npm run build       // build
npm run test        // run tests only
npm run test:cover  // run tests and view coverage report
```

## API

* [Bar](#bar)
* [Area](#area)
* [Line](#line)
* [Pie](#pie)
* [Scatter](#scatter)
* [Corona](#corona)
* [Stacked Area](#stacked-area)
* [Stream](#stream)
* [Grouped Bar](#grouped-bar)
* [Multi Line](#multi-line)


### Bar
[<img alt="Bar" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/bar.jpg">](https://vizartjs.github.io/bar.html)
```javascript
import { Bar } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},

	data: {
		x: { accessor: 'age', type: 'number', name: 'Age' },
		y: [ { accessor: 'income', type: 'number', name: 'Monthly Income' } ]
	},
};

const fakeData = [
	{ age: 19, income: 9 }
]

const _chart = new Bar('#chart', options);
_chart.render(fakeData);
```

### Area
[<img alt="Area" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/area.jpg">](https://vizartjs.github.io/area.html)
```javascript
import { Area } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},

	data: {
		x: { accessor: 'age', type: 'number', name: 'Age' },
		y: [ { accessor: 'income', type: 'number', name: 'Monthly Income' } ]
	},
};

const fakeData = [
	{ age: 19, income: 9 }
]

const _chart = new Area('#chart', options);
_chart.render(fakeData);
```

### Line
[<img alt="Line" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/line.jpg">](https://vizartjs.github.io/line.html)
```javascript
import { Line } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},

	data: {
		x: { accessor: 'age', type: 'number', name: 'Age' },
		y: [ { accessor: 'income', type: 'number', name: 'Monthly Income' } ]
	},
};

const fakeData = [
	{ age: 19, income: 9 }
]

const _chart = new Line('#chart', options);
_chart.render(fakeData);
			
```
### Scatter
[<img alt="Scatter" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/scatter.jpg">](https://vizartjs.github.io/scatter.html)
```javascript
import { Scatter } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},

	data: {
		x: { accessor: 'age', type: 'number', name: 'Age' },
		y: [ { accessor: 'income', type: 'number', name: 'Monthly Income' } ]
		z: { accessor: 'companyYears', type: 'number', name: 'Years at Company' } //optional
	},
};

const fakeData = [
	{ age: 19, income: 9, companyYears:5 }
]

const _chart = new Scatter('#chart', options);
_chart.render(fakeData);
			
```
### Pie
[<img alt="Pie" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/pie.jpg">](https://vizartjs.github.io/pie.html)
```javascript
import { Pie } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
		margin: { left: 30, right: 30, top: 10, bottom: 30 }
	},

	data: {
		x: { accessor: 'age', type: 'number', name: 'Age' },
		y: [ { accessor: 'income', type: 'number', name: 'Monthly Income' } ]
	},
};

const fakeData = [
	{ age: 19, income: 9 }
]

const _chart = new Pie('#chart', options);
_chart.render(fakeData);
```

### Corona
[<img alt="Corona" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/corona.jpg">](https://vizartjs.github.io/corona.html)
```javascript
import { Corona } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
			margin: { left: 30, right: 30, top: 10, bottom: 30 }
		},

	data: {
		s: { name: 'Department', type: 'string', accessor: 'dep'},
		x:
			{ name: 'Age', type: 'string', accessor: 'age'}
		,
		y: [
			{ name: 'Monthly Income', type: 'number', accessor: 'income'}
		],
	},

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
		stackLayout: false, // stack areas
		stackMethod: 'expand',
		isArea: true	//If true the area and stroke will follow a round path (cardinal-closed),
	}
};

const _data = [
	{ age: 19, income: 9, dep: 'science' }
]

const _chart = new Corona('#chart', options);
_chart.render(_data);
			
```
### Stacked Area
[<img alt="Stacked Area" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/multi_area.jpg">](https://vizartjs.github.io/multi_area.html)
```javascript
import { StackedArea } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
			margin: { left: 30, right: 30, top: 10, bottom: 30 }
		},

	data: {
		s: { name: 'Department', type: 'string', accessor: 'dep'},
		x: { name: 'Age', type: 'string', accessor: 'age'},
		y: [ { name: 'Monthly Income', type: 'number', accessor: 'income'} ],
	},
	plots: {
		stackLayout: true,
		stackMethod: 'zero',
		curve: 'natural',
		strokeWidth: 2,
		opacityArea: 0.7
	}
};

const _data = [
	{ age: 19, income: 9, dep: 'science' }
]

const _chart = new StackedArea('#chart', options);
_chart.render(_data);
```
### Stream
[<img alt="Stream" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/stream.jpg">](https://vizartjs.github.io/stream.html)
```javascript
import { Stream } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
			margin: { left: 30, right: 30, top: 10, bottom: 30 }
		},

	data: {
		s: { name: 'Department', type: 'string', accessor: 'dep'},
		x: { name: 'Age', type: 'string', accessor: 'age'},
		y: [ { name: 'Monthly Income', type: 'number', accessor: 'income'} ],
	}
};

const _data = [
	{ age: 19, income: 9, dep: 'science' }
]

const _chart = new Stream('#chart', options);
_chart.render(_data);
```

### Grouped Bar
[<img alt="Grouped Bar" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/bar_grouped.jpg">](https://vizartjs.github.io/bar_grouped.html)
```javascript
import { StackedBar } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
			margin: { left: 30, right: 30, top: 10, bottom: 30 }
		},

	data: {
		s: { name: 'Department', type: 'string', accessor: 'dep'},
		x: { name: 'Age', type: 'string', accessor: 'age'},
		y: [ { name: 'Monthly Income', type: 'number', accessor: 'income'} ],
	},
};

const _data = [
	{ age: 19, income: 9, dep: 'science' }
]

const _chart = new StackedBar('#chart', options);
_chart.render(_data);
```
### Multi-Line
[<img alt="Multi line" src="https://github.com/vizartjs/vizartjs.github.io/blob/master/img/charts/multi_line.jpg">](https://vizartjs.github.io/multi_line.html)
```javascript
import { MultiLine } from 'vizart-basic';
import 'vizart-basic/dist/vizart-basic.css';

const options = {
	chart: {
		height: 420,
			margin: { left: 30, right: 30, top: 10, bottom: 30 }
		},

	data: {
		s: { name: 'Department', type: 'string', accessor: 'dep'},
		x: { name: 'Age', type: 'string', accessor: 'age'},
		y: [ { name: 'Monthly Income', type: 'number', accessor: 'income'} ],
	},
	plots: {
		stackLayout: true,
		stackMethod: 'zero',
		curve: 'natural',
		strokeWidth: 2,
		opacityArea: 0.7
	}
};

const _data = [
	{ age: 19, income: 9, dep: 'science' }
]

const _chart = new MultiLine('#chart', options);
_chart.render(_data);
```
### 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details




