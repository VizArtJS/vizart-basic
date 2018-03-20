const getRadius = opt => {
  const outerRadius =
    Math.min(opt.chart.innerWidth / 2, opt.chart.innerHeight / 2) -
    opt.plots.outerRadiusMargin;
  const innerRadius = outerRadius * opt.plots.innerRadiusRatio;

  return [innerRadius, outerRadius];
};

export default getRadius;
