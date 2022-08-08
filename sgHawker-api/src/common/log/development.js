import winston from 'winston';

// winston.emitErrs = true;

// Winston logger configuration for development mode
export default winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ],
  exitOnError: false
});
