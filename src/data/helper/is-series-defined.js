
const isSeriesDefined = opt => opt.data.s !== undefined && opt.data.s !== null && opt.data.s.accessor !== undefined
&& opt.data.s.accessor !== null;

export default isSeriesDefined;
