import getRadius from './get-radius';

const getLabelRadius = (opt, scale, maxR) => {
  const radius = getRadius(opt)[1] * scale;

  let textRadius;

  if (opt.plots.axisLabelAlign === true) {
    const threshold =
      opt.plots.axisLabelAlignThreshold > 1
        ? opt.plots.axisLabelAlignThreshold
        : radius * opt.plots.axisLabelAlignThreshold;

    textRadius = Math.max(maxR, threshold);
  } else {
    textRadius = radius;
  }

  return textRadius * scale + opt.plots.axisLabelOffset;
};

export default getLabelRadius;
