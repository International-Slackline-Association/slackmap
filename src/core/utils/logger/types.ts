import { LogEntry } from 'winston';

export type JsonObject = { [Key in string]?: any };

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'metric';

export interface LoggerConfig {
  logLevel?: LogLevel;
  customLevels?: { [key: string]: any };
}

export type LogObject = {
  level: LogLevel;
  data?: JsonObject;
  meta?: LoggerMeta;
  timestamp?: string;
} & LogEntry;

export interface LoggerMeta {
  lambdaName?: string;
}
