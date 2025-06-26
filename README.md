🗺️ IVS Events Map 2025
A interactive map application displaying IVS events across Japan, built with React TypeScript and integrated with 4S API.

🌟 Features
Interactive Map: Google Maps integration for event visualization
Real-time Data: Live event data from 4S API
Responsive Design: Works on desktop and mobile devices
Event Details: Detailed information for each event including location, time, and description
Japanese Interface: Fully localized for Japanese users
🛠️ Tech Stack
Frontend: React + TypeScript (.tsx)
Maps: Google Maps API
Data Source: 4S API
Styling: CSS + React Components
Build Tool: Vite/Create React App (based on project structure)
📂 Project Structure
ivs-events-map/
├── src/
│   ├── components/
│   │   ├── EventMap.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useEvents.tsx
│   │   └── ...
│   ├── types/
│   │   ├── events.ts
│   │   └── ...
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
└── README.md
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)
npm or yarn
Google Maps API key
Installation
Clone the repository:
bash
git clone https://github.com/peaske/ivs-events-map-2025.git
cd ivs-events-map-2025
Install dependencies:
bash
npm install
Set up environment variables:
bash
# Create .env file
touch .env
Add your Google Maps API key:

env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
Start the development server:
bash
npm start
🔧 Configuration
4S API Integration
The app fetches event data from the 4S API:

Endpoint: https://api.4s.link/events
Filters: filter:time=upcoming
Limit: 20 events per page
No authentication required
Google Maps Setup
Get an API key from Google Cloud Console
Enable Maps JavaScript API
Add the key to your .env file
📱 Usage
View Events: Browse events displayed as markers on the map
Event Details: Click on markers to see event information
Navigation: Use map controls to zoom and pan
Filter: Filter events by date, location, or category
🚀 Deployment
GitHub Pages (Recommended)
bash
npm run build
npm run deploy
Vercel
Connect your GitHub repository to Vercel
Set environment variables in Vercel dashboard
Deploy automatically on push
🤝 Claude Integration
This project is designed for seamless Claude integration:

Context Files
CONTEXT.md: Project overview and architecture
CHANGELOG.md: Development history and changes
API_DOCS.md: API integration details
Development Workflow
Make changes locally
Commit with descriptive messages
Push to GitHub
Share repository URL with Claude for context
📋 API Reference
4S API Endpoints
Get Upcoming Events
http
GET https://api.4s.link/events?filter%3Atime=upcoming&limit=20&page=1
Response Structure:

json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "location": "string",
      "latitude": number,
      "longitude": number,
      "startTime": "string",
      "endTime": "string",
      "tags": ["string"]
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number
  }
}
🐛 Known Issues
 Google Maps API key needs environment variable setup
 Mobile responsiveness needs optimization
 Event filtering not yet implemented
🗓️ Roadmap
 Add event filtering by category
 Implement user favorites
 Add event calendar view
 Optimize mobile experience
 Add event search functionality
👥 Contributing
Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Contact
Repository: peaske/ivs-events-map-2025
Issues: GitHub Issues
🙏 Acknowledgments
4S for providing the events API
Google Maps for mapping services
React and TypeScript communities
Last Updated: June 2025 Version: 1.0.0

