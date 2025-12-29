/**
 * Discover the server port by trying common ports
 */
export async function discoverServerPort() {
  const commonPorts = [3001, 3002, 3003, 3004, 3005];

  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK') {
          console.log(`✅ Found server on port ${port}`);
          // Store the discovered port
          localStorage.setItem('serverPort', port.toString());
          return port;
        }
      }
    } catch (error) {
      // Port not available, try next one
      continue;
    }
  }

  // Fallback to default
  console.warn('⚠️  Could not discover server port, using default 3001');
  return 3001;
}

/**
 * Get the server URL with dynamic port discovery
 */
export async function getServerUrl() {
  // Check if we have a cached port
  const cachedPort = localStorage.getItem('serverPort');

  if (cachedPort) {
    // Verify the cached port is still valid
    try {
      const response = await fetch(`http://localhost:${cachedPort}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });

      if (response.ok) {
        return `http://localhost:${cachedPort}`;
      }
    } catch (error) {
      // Cached port is no longer valid, clear it
      localStorage.removeItem('serverPort');
    }
  }

  // Discover the port
  const port = await discoverServerPort();
  return `http://localhost:${port}`;
}

/**
 * Get base API URL
 */
export async function getApiBaseUrl() {
  const serverUrl = await getServerUrl();
  return `${serverUrl}/api`;
}
