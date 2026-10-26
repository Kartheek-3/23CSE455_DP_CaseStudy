class BootstrapConsoleBackend {
  write(level, message) { return `${level}: ${message}`; }
}

class PrettyConsoleBackend {
  write(level, message) { return `[${level.toUpperCase()}] ${message}`; }
}

class JsonConsoleBackend {
  write(level, message) { return JSON.stringify({ level, message }); }
}

class LogManager {
  constructor(backend) { this.backend = backend; }

  setBackend(backend) {
    if (backend == null) throw new Error('backend is required');
    this.backend = backend;
  }

  log(level, message) { return this.backend.write(level, message); }
}

module.exports = { LogManager, BootstrapConsoleBackend, PrettyConsoleBackend, JsonConsoleBackend };
