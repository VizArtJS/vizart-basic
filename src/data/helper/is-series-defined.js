import { check } from 'vizart-core';

const isSeriesDefined = opt => check(opt.data.s) && check(opt.data.s.accessor);

export default isSeriesDefined;
