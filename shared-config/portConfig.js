const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'port-config.json');

class PortConfig {
  constructor() {
    this.serverPort = null;
    this.clientPort = null;
  }

  /**
   * Load configuration from file
   */
  load() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        const config = JSON.parse(data);
        this.serverPort = config.serverPort;
        this.clientPort = config.clientPort;
        return config;
      }
    } catch (error) {
      console.warn('⚠️  Could not load port config:', error.message);
    }
    return null;
  }

  /**
   * Save configuration to file
   */
  save() {
    try {
      const config = {
        serverPort: this.serverPort,
        clientPort: this.clientPort,
        timestamp: Date.now()
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Failed to save port config:', error.message);
      return false;
    }
  }

  /**
   * Set server port
   */
  setServerPort(port) {
    this.serverPort = port;
    this.save();
  }

  /**
   * Set client port
   */
  setClientPort(port) {
    this.clientPort = port;
    this.save();
  }

  /**
   * Get server port
   */
  getServerPort() {
    this.load();
    return this.serverPort;
  }

  /**
   * Get client port
   */
  getClientPort() {
    this.load();
    return this.clientPort;
  }

  /**
   * Clear configuration
   */
  clear() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
      }
    } catch (error) {
      console.warn('⚠️  Could not clear port config:', error.message);
    }
  }

  /**
   * Get full configuration
   */
  getConfig() {
    this.load();
    return {
      serverPort: this.serverPort,
      clientPort: this.clientPort
    };
  }
}

module.exports = new PortConfig();
