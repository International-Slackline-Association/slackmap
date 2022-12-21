import type { CloudWatchLogsDecodedData, CloudWatchLogsEvent, CloudWatchLogsHandler } from 'aws-lambda';

import { writeLogs } from 'core/utils/logger/cloudwatch';
import { LogObject } from 'core/utils/logger/types';
import { gunzipSync } from 'zlib';

const cloudwatchLogEventHandler: CloudWatchLogsHandler = async (event) => {
  const logs: LogObject[] = createLogFromSubscriptionEvent(event);
  await writeLogs(logs);
};

function createLogFromSubscriptionEvent(event: CloudWatchLogsEvent): LogObject[] {
  const payload = Buffer.from(event.awslogs.data, 'base64');
  const unzipped = gunzipSync(payload);
  const cwLogPayload: CloudWatchLogsDecodedData = JSON.parse(unzipped.toString('ascii'));
  const logs = cwLogPayload.logEvents.map((l) => JSON.parse(l.message) as LogObject);

  // Filter any log that wasn't created by the logger
  const appLogs = logs.filter((l) => (l.message !== null || l.message !== undefined) && l.level);

  return appLogs.map<LogObject>((l) => ({
    message: l.message,
    level: l.level,
    meta: l.meta,
    timestamp: l.timestamp,
    data: l.data,
  }));
}

export const main = cloudwatchLogEventHandler;
