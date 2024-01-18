import {
  CreateLogStreamCommand,
  DataAlreadyAcceptedException,
  DescribeLogStreamsCommand,
  InputLogEvent,
  InvalidSequenceTokenException,
  PutLogEventsCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-cloudwatch-logs';
import { cwLogs } from 'core/aws/clients';

import { LogObject } from './types';

const APPLICATION_LOG_GROUP_NAME = process.env.APPLICATION_LOG_GROUP_NAME as string;

export async function writeLogs(logs: LogObject[]) {
  const logGroupsByStream = groupByStreams(logs);

  for (const streamName in logGroupsByStream) {
    const logs = logGroupsByStream[streamName];
    await writeToStream(streamName, logs);
  }
}

async function writeToStream(streamName: string, logs: LogObject[], sequenceToken?: string) {
  if (logs.length > 0) {
    const formattedLogEvents = logs.map<InputLogEvent>((l) => {
      const { timestamp, ...rest } = l;
      return {
        timestamp: new Date(timestamp || new Date()).getTime(),
        message: JSON.stringify(rest),
      };
    });
    await cwLogs
      .send(
        new PutLogEventsCommand({
          logGroupName: APPLICATION_LOG_GROUP_NAME,
          logStreamName: streamName,
          sequenceToken: sequenceToken,
          logEvents: formattedLogEvents,
        }),
      )
      .then((r) => {
        if (r.rejectedLogEventsInfo) {
          console.warn('Log Event is rejected', { info: r.rejectedLogEventsInfo });
        }
      })
      .catch(async (err) => {
        if (err instanceof ResourceNotFoundException) {
          const isStreamCreated = await ensureStreamExists(streamName);
          if (isStreamCreated) {
            await writeToStream(streamName, logs);
          }
        } else if (
          err instanceof InvalidSequenceTokenException ||
          err instanceof DataAlreadyAcceptedException
        ) {
          // Message = The given sequenceToken is invalid. The next expected sequenceToken is: XXXX
          // Message = "The given batch of log events has already been accepted. The next batch can be sent with sequenceToken: XXX"
          const token = err.message.split(':')[1].trim();
          if (token) {
            await writeToStream(streamName, logs, token);
          }
        } else {
          throw err;
        }
      });
  }
}

async function ensureStreamExists(streamName: string) {
  const streamNotExists = await cwLogs
    .send(
      new DescribeLogStreamsCommand({
        logGroupName: APPLICATION_LOG_GROUP_NAME,
        logStreamNamePrefix: streamName,
      }),
    )
    .then((data) => data.logStreams?.length === 0)
    .catch(() => true);
  if (streamNotExists) {
    await cwLogs.send(
      new CreateLogStreamCommand({
        logGroupName: APPLICATION_LOG_GROUP_NAME,
        logStreamName: streamName,
      }),
    );
    return true;
  }
  return false;
}

function groupByStreams(logs: LogObject[]) {
  const group: { [key in string]: LogObject[] } = {};

  for (const log of logs) {
    let streamName = 'default';
    if (log.level === 'metric') {
      streamName = `metrics`;
    } else {
      streamName = new Date().toISOString().split('T')[0];
    }
    group[streamName] = [...(group[streamName] || []), log];
  }
  return group;
}
