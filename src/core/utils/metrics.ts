import { Logger } from './logger';

type DimensionValue = '';

const metricLogger = new Logger({
  logLevel: 'metric',
  customLevels: { metric: 0 },
});

export const emitMetric = (dimension: DimensionValue, value = 1) => {
  const metricLog = metricLogger.createLogObject(`Emission of Count Metric: ${dimension}`, 'metric', {
    dimension,
    value,
  });
  metricLogger.log(metricLog);
};
