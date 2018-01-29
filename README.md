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

* [Bar](https://github.com/VizArtJS/vizart-basic/wiki/bar)
* [Area](https://github.com/VizArtJS/vizart-basic/wiki/area)
* [Line](https://github.com/VizArtJS/vizart-basic/wiki/line)
* [Pie](https://github.com/VizArtJS/vizart-basic/wiki/pie)
* [Row](https://github.com/VizArtJS/vizart-basic/wiki/row)
* [Scatter](https://github.com/VizArtJS/vizart-basic/wiki/scatter)
* [Corona](https://github.com/VizArtJS/vizart-basic/wiki/corona)
* [Stacked Area](https://github.com/VizArtJS/vizart-basic/wiki/stacked-area)
* [Stream](https://github.com/VizArtJS/vizart-basic/wiki/stream)
* [Grouped Bar](https://github.com/VizArtJS/vizart-basic/wiki/grouped-bar)
* [Multi Line](https://github.com/VizArtJS/vizart-basic/wiki/multi-line)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details




