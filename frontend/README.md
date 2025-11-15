# Agent Hub Frontend

Self-evolving AI agent launcher frontend built with React + TypeScript + Tailwind CSS.

## 🚀 Quick Start

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```

Visit http://localhost:5173

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── LoginView.tsx  # Email login
│   │   ├── AgentCard.tsx  # Agent card component
│   │   ├── AgentGrid.tsx  # Suggested agents grid
│   │   └── ChatView.tsx   # Chat interface
│   ├── services/          # API and data services
│   │   ├── api.ts         # Backend API client
│   │   └── mockData.ts    # Mock data for development
│   ├── types/             # TypeScript types
│   │   └── index.ts       # All type definitions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles + Tailwind
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Features

### Implemented
- ✅ Email-based login (Fastino integration ready)
- ✅ Agent suggestions grid with Freepik avatars
- ✅ Personalized agent recommendations
- ✅ Chat interface with message history
- ✅ Thumbs up/down feedback system
- ✅ Real-time search indicators (Linkup ready)
- ✅ Source URL display
- ✅ Tool usage badges
- ✅ Responsive design
- ✅ Mock data for offline development

### Backend Integration Points
The frontend is ready to connect to the backend. Update these in `src/services/api.ts`:

1. **Login** → `POST /api/login`
2. **Get Suggestions** → `GET /api/agents/suggestions`
3. **Create Instance** → `POST /api/agents/instances`
4. **Get Chat History** → `GET /api/chat/history`
5. **Send Message** → `POST /api/chat/send`
6. **Submit Feedback** → `POST /api/feedback`

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000/api
```

### Backend Proxy
Vite dev server proxies `/api` requests to `http://localhost:3000` by default.
Update `vite.config.ts` if your backend runs on a different port.

## 🎯 Mock Data Development

The app works standalone with mock data when the backend isn't available.
See `src/services/mockData.ts` for sample agents, messages, and profiles.

This allows you to develop and test the UI independently.

## 📦 Dependencies

### Core
- React 18
- TypeScript 5
- Vite 5

### UI
- Tailwind CSS 3
- lucide-react (icons)

### HTTP
- Axios (API client)

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Environment Variables on Vercel
```
VITE_API_URL=https://your-backend.railway.app/api
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the primary color scheme.

### Avatars
Replace Freepik URLs in `mockData.ts` with actual Freepik API calls in production.

### Components
All components are in `src/components/` and use TypeScript + Tailwind for styling.

## 🐛 Troubleshooting

### API not connecting
1. Check backend is running on port 3000
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for CORS errors

### Mock data not showing
1. Clear browser cache
2. Check `mockData.ts` is imported correctly
3. Verify API errors trigger fallback to mock data

## 📝 Next Steps for You

1. **Connect to Backend**: Once backend is ready, update API base URL
2. **Add Freepik Integration**: Replace mock avatar URLs with real Freepik API calls
3. **Polish UI**: Add animations, loading states, error boundaries
4. **Deploy**: Push to Vercel and connect to Railway backend

## 🎯 Key Files to Edit

When enhancing with Claude web agent:
- `src/App.tsx` - Main app logic
- `src/components/*.tsx` - UI components
- `src/services/api.ts` - API integration
- `tailwind.config.js` - Styling customization
