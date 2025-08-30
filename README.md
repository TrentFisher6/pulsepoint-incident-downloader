# PulsePoint Incident Downloader

A Next.js web application for downloading and analyzing emergency incident data from PulsePoint, a real-time emergency response platform used by fire departments and EMS agencies across the United States.

## 🚨 Overview

PulsePoint provides real-time emergency incident information to the public through their mobile app and API. This application allows users to:

- **Fetch incident data** from any PulsePoint-enabled emergency agency
- **View incidents** in both summary and detailed JSON formats
- **Export data** as JSON or CSV files for analysis
- **Decrypt encrypted API responses** automatically
- **Process and normalize** incident data with proper date/time handling

## ✨ Features

### Core Functionality
- **Agency-based Data Retrieval**: Enter any valid PulsePoint agency ID to fetch incident data
- **Real-time Decryption**: Automatically decrypts PulsePoint's AES-256-CBC encrypted API responses
- **Dual Data Views**: Toggle between summary statistics and raw JSON data
- **Export Options**: Download data as formatted JSON or CSV files
- **Data Processing**: Converts timestamps, maps incident types, and adds coordinate arrays

### Data Categories
- **Active Incidents**: Currently ongoing emergency responses
- **Recent Incidents**: Recently completed incidents
- **Incident Types**: Medical emergencies, fires, traffic collisions, hazmat, rescue operations, and more

### User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Real-time Feedback**: Loading states and error handling
- **Data Visualization**: Summary statistics and formatted JSON display
- **Copy to Clipboard**: Easy sharing of JSON data

## 🛠️ Technical Architecture

### Frontend (Next.js 15.2.4)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Client-side data processing** and export functionality
- **Responsive design** with modern UI components

### Backend API Routes
- **`/api/incidents`**: Fetches and decrypts incident data from PulsePoint
- **`/api/agencies`**: Retrieves available emergency agencies
- **AES-256-CBC decryption** with custom key derivation algorithm

### Data Processing Pipeline
1. **API Request**: Fetch encrypted data from PulsePoint API
2. **Decryption**: Decrypt using derived AES-256-CBC key
3. **Normalization**: Convert timestamps and map incident types
4. **Enhancement**: Add coordinate arrays and unique identifiers
5. **Export**: Format for JSON or CSV download

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pulsepoint-incident-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

```bash
npm run build
npm start
```

The application is configured for standalone deployment with optimized builds.

## 📖 Usage Guide

### Finding Agency Codes
Agency codes are numeric identifiers for emergency services. Common examples:
- `05900` - Alexandria Fire Department, VA (default)
- `1441` - Los Angeles Fire Department, CA
- Use the agency search feature to find specific departments

### Downloading Data

1. **Enter Agency Code**: Input the numeric agency identifier
2. **Fetch Incidents**: Click "Fetch Incidents" to retrieve current data
3. **View Results**: Toggle between Summary and Raw JSON views
4. **Export Data**: 
   - **Download JSON**: Complete incident data with metadata
   - **Download CSV**: Spreadsheet-friendly format with key fields

### CSV Export Fields
- **ID**: Unique incident identifier
- **CallReceivedDateTime**: When the emergency call was received
- **ClosedDateTime**: When the incident was resolved
- **PulsePointIncidentCallType**: Type of emergency (mapped to readable format)
- **Latitude/Longitude**: Incident coordinates
- **Units**: Emergency response units assigned
- **Location**: Full address or location description

### Incident Type Mapping
The application maps PulsePoint's abbreviated codes to readable descriptions:
- `ME` → Medical Emergency
- `TC` → Traffic Collision  
- `FA` → Fire Alarm
- `VF` → Vehicle Fire
- `RF` → Residential Fire
- `HMR` → Hazmat Response
- And many more...

## 🔧 Configuration

### Environment Setup
The application works out-of-the-box with no additional environment variables required. All API endpoints are proxied through Next.js API routes.

### Customization Options
- **Default Agency**: Modify the default agency code in `app/page.tsx`
- **Incident Types**: Update mappings in `public/incident_types.json`
- **Export Fields**: Customize CSV fields in the download handler
- **Styling**: Modify Tailwind classes for different visual themes

## 📊 Data Structure

### Incident Object
```typescript
interface Incident {
  ID: string;
  CallReceivedDateTime: string;
  ClosedDateTime: string | null;
  PulsePointIncidentCallType: string;
  Latitude: string;
  Longitude: string;
  Unit?: Unit[];
  FullDisplayAddress?: string;
  // Enhanced fields added during processing
  coords?: [number, number];
  uid?: string;
  incident_type?: string;
}
```

### Response Structure
```typescript
interface Incidents {
  active: Incident[];  // Currently ongoing incidents
  recent: Incident[];  // Recently completed incidents
}
```

## 🔐 Security & Decryption

The application implements PulsePoint's proprietary decryption algorithm:

1. **Password Generation**: Creates decryption key from hardcoded string pattern
2. **Key Derivation**: Uses MD5 hashing with salt for AES key generation  
3. **AES-256-CBC**: Decrypts incident data using derived key and initialization vector
4. **Data Parsing**: Processes decrypted JSON and handles escape characters

**Note**: This decryption method is reverse-engineered from PulsePoint's client-side JavaScript and is used for legitimate data access purposes.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- **Additional Export Formats**: KML, GeoJSON, Excel
- **Data Visualization**: Maps, charts, trend analysis
- **Agency Management**: Better agency search and favorites
- **Historical Data**: Archive and track incident patterns
- **Real-time Updates**: WebSocket integration for live data
- **Mobile Optimization**: Enhanced mobile experience

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and research purposes. Please respect PulsePoint's terms of service and use responsibly.

## ⚠️ Disclaimer

This application accesses publicly available emergency incident data through PulsePoint's API. The data is provided for informational purposes only and should not be used for emergency response or critical decision-making. Always call 911 for emergencies.

## 🙏 Acknowledgments

- **PulsePoint Foundation** for providing public emergency data
- **Emergency Services** for their dedication to public safety
- **Next.js Team** for the excellent React framework
- **Open Source Community** for the tools and libraries used

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for public safety transparency and emergency services research.**