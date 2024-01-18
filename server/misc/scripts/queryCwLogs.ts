import { FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { cwLogs } from 'core/aws/clients';

import { parseCliArgs } from './utils';

const parseTimeRange = (duration: string) => {
  const num = parseInt(duration.slice(0, -1));
  const unit = duration.slice(-1);
  const now = new Date().getTime();
  switch (unit) {
    case 's':
      return { startTime: now - num * 1000, endTime: now };
    case 'm':
      return { startTime: now - num * 1000 * 60, endTime: now };
    case 'h':
      return { startTime: now - num * 1000 * 60 * 60, endTime: now };
    case 'd':
      return { startTime: now - num * 1000 * 60 * 60 * 24, endTime: now };
    case 'w':
      return { startTime: now - num * 1000 * 60 * 60 * 24 * 7, endTime: now };
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
};

const queryCwLogs = async () => {
  const args = parseCliArgs();
  const { startTime, endTime } = parseTimeRange(args.time ?? '8d');

  cwLogs
    .send(
      new FilterLogEventsCommand({
        logGroupName: 'slackmap/applicationLogs-prod',
        startTime,
        endTime,
      }),
    )
    .then((data) => {
      const logs = data.events?.map((e) => {
        const msg = JSON.parse(e.message || '{}');
        msg.date = e.logStreamName;
        delete msg.level;
        delete msg.meta;
        return msg;
      });
      console.log(JSON.stringify(logs, null, 2));
    });
};

queryCwLogs();
