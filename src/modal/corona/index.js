import { stackedWithoutAxes } from '../../helper/builder';
import animate from './animate';
import CoronaOptions from './options';

const corona = stackedWithoutAxes(CoronaOptions, animate);

export default corona;
