class PrettyConsoleBackend {
  get name() { return 'pretty'; }
  write(level, message) { return `[${level.toUpperCase()}] ${message}`; }
}

class JsonConsoleBackend {
  get name() { return 'json'; }
  write(level, message) { return JSON.stringify({ level, message }); }
}

function createLoggingBackend(format) {
  if (format == null || format === 'pretty') return new PrettyConsoleBackend();
  if (format === 'json') return new JsonConsoleBackend();
  throw new Error('logging.format must be either pretty or json');
}

module.exports = { createLoggingBackend };
