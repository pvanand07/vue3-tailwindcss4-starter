export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract building_code and section_id from the URL
    // URL format: /api/v1/content/[building_code]/[section_id]
    const urlParts = req.url.split('/');
    const buildingCodeIndex = urlParts.indexOf('content') + 1;
    const sectionIdIndex = buildingCodeIndex + 1;
    
    if (buildingCodeIndex >= urlParts.length || sectionIdIndex >= urlParts.length) {
      return res.status(400).json({ error: 'Missing building_code or section_id parameter' });
    }
    
    const buildingCode = urlParts[buildingCodeIndex];
    const sectionId = urlParts[sectionIdIndex];
    
    console.log('Content API - Building Code:', buildingCode);
    console.log('Content API - Section ID:', sectionId);

    // Forward the request to the external content API
    const response = await fetch(`https://kmbr-chat.elevatics.site/api/v1/content/${buildingCode}/${sectionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': '44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4',
      }
    });

    console.log('External content API response status:', response.status);

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External content API error:', errorText);
      return res.status(response.status).json({ 
        error: `External content API error: ${response.status}`,
        details: errorText 
      });
    }

    // Forward relevant response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Get the response data and send it back
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Content API forwarding error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

