const net = require('net');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Find an available port starting from the preferred port
 */
async function findAvailablePort(preferredPort = 3001, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i;
    const available = await isPortAvailable(port);

    if (available) {
      return port;
    }
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts starting from ${preferredPort}`);
}

module.exports = {
  isPortAvailable,
  findAvailablePort
};
