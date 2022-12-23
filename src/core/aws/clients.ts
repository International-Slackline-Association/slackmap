import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const ddb: DocumentClient = new DocumentClient();
export const cwLogs = new AWS.CloudWatchLogs();
export const ssm = new AWS.SSM();
export const ses = new AWS.SES();
export const s3 = new AWS.S3();
export const cloudfront = new AWS.CloudFront();
