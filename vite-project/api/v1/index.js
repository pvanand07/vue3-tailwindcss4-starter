export default async function handler(req, res) {
  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract the API path from the request URL
    const apiPath = req.url.replace('/api/v1/', '');
    console.log('API Path:', apiPath);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);

    // Construct the external API URL
    const externalApiUrl = `https://api4iresearcher-v5-1.elevatics.site/api/v1/${apiPath}`;
    console.log('Forwarding to:', externalApiUrl);
    
    // Prepare request options
    const requestOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': '44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4',
        // Forward any additional headers from the original request
        ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
        ...(req.headers['accept-language'] && { 'Accept-Language': req.headers['accept-language'] }),
      }
    };

    // Add body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      requestOptions.body = JSON.stringify(req.body);
    }

    // Forward the request to the external API
    const response = await fetch(externalApiUrl, requestOptions);

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return res.status(response.status).json({ 
        error: `External API error: ${response.status}`,
        details: errorText,
        endpoint: externalApiUrl
      });
    }

    // Forward relevant response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Handle streaming response (for chat endpoints)
    if (response.body && apiPath.includes('chat')) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert Uint8Array to string and write to response
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
        res.end();
      } finally {
        reader.releaseLock();
      }
    } else {
      // Handle regular JSON response (for document endpoints)
      const data = await response.text();
      res.send(data);
    }

  } catch (error) {
    console.error('API forwarding error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      endpoint: 'https://api4iresearcher-v5-1.elevatics.site/api/v1'
    });
  }
}
