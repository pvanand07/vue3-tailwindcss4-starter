# Vue 3 AI Chat Application

A modern Vue 3 AI chatbot application using Vite's proxy feature to secure API calls.

## Architecture

This application uses **Vite's proxy configuration** to move API calls to the server side:

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS v4 + Pinia
- **API Proxy**: Vite development server proxies API calls to external services
- **Benefits**: 
  - API keys are secured on the server (not exposed to client)
  - Simple setup - no additional server needed
  - Works seamlessly in development

## How It Works

1. **Frontend** makes API calls to `/api/v1/chat`
2. **Vite dev server** intercepts these calls and forwards them to the external API
3. **API key** is automatically added by the proxy configuration
4. **Response** is streamed back to the frontend

## Setup Instructions

### 1. Install Dependencies

```bash
cd vite-project
pnpm install
```

### 2. Start Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### API Proxy Configuration

The proxy is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api/v1/chat': {
      target: 'https://kmbr-chat.elevatics.site',
      changeOrigin: true,
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          // Add API key to all requests
          proxyReq.setHeader('X-API-Key', 'your-api-key-here')
        })
      }
    }
  }
}
```

### Updating API Key

To update the API key, edit the `vite.config.ts` file and change the value in the `setHeader` call.

## Security Benefits

- ✅ API keys are never exposed to the client
- ✅ Requests are proxied through the development server
- ✅ No additional server setup required
- ✅ Works seamlessly with hot module replacement

## Production Deployment

For production, you'll need to:

1. **Set up a reverse proxy** (nginx, Apache, etc.) to handle API calls
2. **Configure environment variables** for API keys
3. **Use a proper backend server** for production API handling

### Example Nginx Configuration

```nginx
location /api/v1/chat {
    proxy_pass https://kmbr-chat.elevatics.site;
    proxy_set_header X-API-Key "your-api-key-here";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Development Workflow

1. **Start the dev server**: `pnpm run dev`
2. **Make API calls**: Use `/api/v1/chat` endpoint in your code
3. **Hot reload**: Changes are automatically reflected
4. **Debug**: Check browser network tab to see proxied requests

## Troubleshooting

### Common Issues

1. **CORS Errors**: The proxy should handle CORS automatically
2. **API Key Issues**: Check the `vite.config.ts` file for correct API key
3. **Proxy Not Working**: Ensure you're using the correct endpoint path (`/api/v1/chat`)

### Debugging

- Check the browser's Network tab to see proxied requests
- Look at the Vite dev server console for proxy logs
- Verify the API key is being sent in request headers

## Next Steps

Consider these improvements for production:

- Set up environment variables for API keys
- Add request/response logging
- Implement rate limiting
- Add error handling middleware
- Set up proper CORS configuration 