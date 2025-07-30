export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Forwarding request to external API...');
    console.log('Request body:', req.body);

    // Forward the request to the external API
    const response = await fetch('https://kmbr-chat.elevatics.site/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': '44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4',
      },
      body: JSON.stringify(req.body)
    });

    console.log('External API response status:', response.status);

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return res.status(response.status).json({ 
        error: `External API error: ${response.status}`,
        details: errorText 
      });
    }

    // Forward relevant response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Handle streaming response
    if (response.body) {
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
      // Handle non-streaming response
      const data = await response.text();
      res.send(data);
    }

  } catch (error) {
    console.error('API forwarding error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}