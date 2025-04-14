import {
  Log,
  LogCollector,
  LogLevel,
  LogLevels,
  LogFunction,
} from "@/types/log";

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];
  const getAll = () => logs;

  const logFunctions = {} as Record<LogLevel, LogFunction>;
  LogLevels.forEach(
    (level) =>
      (logFunctions[level] = (message: string) =>
        logs.push({ level, message, timestamp: new Date() }))
  );
  return {
    getAll,
    ...logFunctions,
  };
}
