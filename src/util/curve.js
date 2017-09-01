import {
    curveBasisClosed,
    curveBasisOpen,
    curveBasis,
    curveBundle,
    curveCardinalClosed,
    curveCardinalOpen,
    curveCardinal,
    curveCatmullRomClosed,
    curveCatmullRomOpen,
    curveCatmullRom,
    curveLinearClosed,
    curveLinear,
    curveNatural,
    curveStep,
    curveStepAfter,
    curveStepBefore,
    curveMonotoneX,
    curveMonotoneY
} from 'd3-shape';

const Curves = {
    LINEAR: 'linear',
    LINEAR_CLOSED: 'linear-closed',
    STEP: 'step',
    STEP_BEFORE: 'step-before',
    STEP_AFTER: 'step-after',
    BASIS: 'basis',
    BASIS_OPEN: 'basis-open',
    BASIS_CLOSED: 'basis-closed',
    BUNDLE: 'bundle',
    CARDINAL: 'cardinal',
    CARDINAL_OPEN: 'cardinal-open',
    CARDINAL_CLOSED: 'cardinal-closed',
    MONOTONE_X: 'monotoneX',
    MONOTONE_Y: 'monotoneY',
    NATURAL: 'natural',
    CATMULL_ROM :'catmull-rom',
    CATMULL_ROM_CLOSED: 'catmull-rom-closed',
    CATMULL_ROM_OPEN: 'catmull-rom-open',
}

let interpolateCurve = function(_curve, _shapes) {
    for (let _shape of _shapes) {
        switch (_curve) {
            case Curves.LINEAR:
                _shape.curve(curveLinear);

                break;
            case Curves.LINEAR_CLOSED:
                _shape.curve(curveLinearClosed);

                break;
            case Curves.STEP:
                _shape.curve(curveStep);

                break;
            case Curves.STEP_BEFORE:
                _shape.curve(curveStepBefore);

                break;
            case Curves.STEP_AFTER:
                _shape.curve(curveStepAfter);

                break;
            case Curves.BASIS:
                _shape.curve(curveBasis);

                break;
            case Curves.BASIS_OPEN:
                _shape.curve(curveBasisOpen);

                break;
            case Curves.BASIS_CLOSED:
                _shape.curve(curveBasisClosed);

                break;
            case Curves.BUNDLE:
                _shape.curve(curveBundle);

                break;
            case Curves.CARDINAL:
                _shape.curve(curveCardinal);

                break;
            case Curves.CARDINAL_OPEN:
                _shape.curve(curveCardinalOpen);

                break;
            case Curves.CARDINAL_CLOSED:
                _shape.curve(curveCardinalClosed);

                break;
            case Curves.MONOTONE_X:
                _shape.curve(curveMonotoneX);
                break;
            case Curves.MONOTONE_Y:
                _shape.curve(curveMonotoneY);
                break;
            case Curves.NATURAL:
                _shape.curve(curveNatural);
                break;

            case Curves.CATMULL_ROM:
                _shape.curve(curveCatmullRom);
                break;

            case Curves.CARDINAL_CLOSED:
                _shape.curve(curveCatmullRomClosed);
                break;

            case Curves.CARDINAL_OPEN:
                _shape.curve(curveCatmullRomOpen);
                break;

            default:
                break;
        }
    }
}

export default interpolateCurve;