# XY-Intelligence - Sales Intelligence Assistant

A modern, fast Vue 3 AI sales intelligence assistant built with TypeScript, Tailwind CSS v4, and Vite. Features real-time chat with AI, beautiful charts, markdown rendering, and a responsive UI for sales intelligence and data analysis.

## 🚀 Features

- **Modern Tech Stack**: Vue 3 + TypeScript + Tailwind CSS v4 + Vite
- **Real-time Chat**: Stream responses from AI API
- **Beautiful Charts**: Support for data visualization and charts
- **Markdown Support**: Rich text rendering with syntax highlighting
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Chat History**: Local storage for conversation persistence
- **Modern UI**: Clean, accessible interface with smooth animations
- **Sales Focus**: Optimized for sales intelligence and data analysis

## 🛠️ Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Type Safety**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router with file-based routing
- **Icons**: Lucide Vue
- **Markdown**: Markdown-it
- **Storage**: PouchDB for local data persistence

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🚀 Deployment

### Quick Deploy to Vercel

1. **Using PowerShell Script** (Windows):
   ```powershell
   .\deploy.ps1
   ```

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Via Vercel Dashboard**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration

### Configuration Files

- `vercel.json`: Configures build settings, API proxy, and SPA routing
- `.gitignore`: Excludes unnecessary files from deployment
- `DEPLOYMENT.md`: Detailed deployment guide

## 🔧 Configuration

### API Configuration

The app is configured to proxy API calls to your chat backend. Update the following files for your API:

- `vite.config.ts`: Development proxy settings
- `vercel.json`: Production API proxy configuration
- `src/api/chat.ts`: API client configuration

### Environment Variables

For production, you can set environment variables in the Vercel dashboard:
- API endpoints
- API keys
- Feature flags

## 📱 Usage

1. **Start a New Chat**: Click "New Chat" to begin a sales intelligence session
2. **Ask Sales Questions**: Type your sales questions and press Enter
3. **View Responses**: AI responses are streamed in real-time with charts and data
4. **Data Visualization**: Responses include beautiful charts and visualizations
5. **Markdown Support**: Responses support rich formatting and code highlighting
6. **Chat History**: Previous sales intelligence sessions are saved locally
7. **Theme Toggle**: Switch between light and dark modes

## 🏗️ Project Structure

```
src/
├── api/           # API client and types
├── components/    # Vue components
│   ├── features/  # Feature-specific components
│   └── layout/    # Layout components
├── pages/         # Route components
├── stores/        # Pinia stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── style.css      # Global styles and Tailwind imports
```

## 🧪 Development

### Adding New Features

1. Create components in `src/components/features/`
2. Add routes in `src/pages/`
3. Update stores in `src/stores/`
4. Add types in `src/types/`

### Testing

```bash
# Run tests (if configured)
pnpm run test

# Run with coverage
pnpm run test:coverage
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

For issues and questions:
- Check the [deployment guide](DEPLOYMENT.md)
- Review the [Vercel documentation](https://vercel.com/docs)
- Open an issue in the repository

---

Built with ❤️ using Vue 3, Tailwind CSS v4, and Vite
