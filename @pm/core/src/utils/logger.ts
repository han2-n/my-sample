export interface LoggerOptions {
  level: 'debug' | 'error' | 'info' | 'warn';
  prefix?: string;
}

/**
 * Create a simple logger with configurable log level and prefix
 *
 * @param options Logger options
 * @returns Logger object with methods for different log levels
 */
export function createLogger(options: LoggerOptions) {
  const { level, prefix = '[Plugin]' } = options;

  // Log level priority - lower number means more verbose
  const logLevels = {
    debug: 0,
    error: 3,
    info: 1,
    warn: 2,
  };

  const minLevel = logLevels[level];

  return {
    debug(message: string, ...args: any[]) {
      if (logLevels.debug >= minLevel) {
        console.debug(`${prefix} ${message}`, ...args);
      }
    },

    error(message: string, ...args: any[]) {
      if (logLevels.error >= minLevel) {
        console.error(`${prefix} ${message}`, ...args);
      }
    },

    info(message: string, ...args: any[]) {
      if (logLevels.info >= minLevel) {
        console.info(`${prefix} ${message}`, ...args);
      }
    },

    warn(message: string, ...args: any[]) {
      if (logLevels.warn >= minLevel) {
        console.warn(`${prefix} ${message}`, ...args);
      }
    },
  };
}
