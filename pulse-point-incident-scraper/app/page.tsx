'use client';

import { useState } from 'react';
import { Scraper } from './scraper';
import { Incidents, Incident } from './types';

export default function Home() {
  const [agencyCode, setAgencyCode] = useState('05900'); // Default to 05900
  const [incidents, setIncidents] = useState<Incidents | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const scraper = new Scraper();
      const data = await scraper.getIncidents(agencyCode);
      console.log('Fetched incidents data:', JSON.stringify(data, null, 2));
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!incidents) return;
    
    const dataStr = JSON.stringify(incidents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulsepoint-incidents-${agencyCode}-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!incidents) return;

    // Define the fields we want to include in the CSV
    const fields = [
      'ID',
      'CallReceivedDateTime',
      'ClosedDateTime',
      'PulsePointIncidentCallType',
      'Latitude',
      'Longitude',
      'Units',
      'Location'
    ];

    // Create CSV header
    const csvRows = [fields.join(',')];

    // Helper function to format date
    const formatDate = (dateStr: any): string => {
      if (!dateStr) return '';
      try {
        console.log('Date value:', dateStr, 'Type:', typeof dateStr);
        // If it's already a string, return it
        if (typeof dateStr === 'string') return dateStr;
        // If it's an object with a date property, use that
        if (typeof dateStr === 'object' && dateStr.date) {
          return new Date(dateStr.date).toISOString();
        }
        // If it's a number (timestamp), convert it
        if (typeof dateStr === 'number') {
          return new Date(dateStr).toISOString();
        }
        // If it's already a Date object
        if (dateStr instanceof Date) {
          return dateStr.toISOString();
        }
        return String(dateStr);
      } catch (e) {
        console.error('Error formatting date:', e, 'Value:', dateStr);
        return '';
      }
    };

    // Helper function to escape CSV values
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Helper function to map incident call types
    const mapIncidentType = (type: string): string => {
      const typeMap: { [key: string]: string } = {
        'ME': 'Medical Emergency',
        'TC': 'Traffic Collision',
        'FA': 'Fire Alarm',
        'VF': 'Vehicle Fire',
        'PS': 'Public Service',
        'GL': 'Gas Leak',
        'INV': 'Investigation',
        'WD': 'Wires Down',
        'HMR': 'Hazmat Response',
        'GAS': 'Gas Leak',
        'LO': 'Lockout',
        'TCE': 'Traffic Collision'
      };
      return typeMap[type] || type;
    };

    // Process all incidents (both active and recent)
    const allIncidents = [...incidents.active, ...incidents.recent];
    
    allIncidents.forEach(incident => {
      const row = fields.map(field => {
        switch (field) {
          case 'CallReceivedDateTime':
            return escapeCSV(formatDate(incident.CallReceivedDateTime));
          case 'ClosedDateTime':
            return escapeCSV(formatDate(incident.ClosedDateTime));
          case 'Units':
            // Get all unit IDs from the incident
            const unitIds = incident.Unit?.map(unit => unit.UnitID).join('; ') || '';
            return escapeCSV(unitIds);
          case 'Location':
            return escapeCSV(incident.FullDisplayAddress || '');
          case 'PulsePointIncidentCallType':
            return escapeCSV(mapIncidentType(incident.PulsePointIncidentCallType));
          default:
            return escapeCSV(incident[field as keyof Incident]);
        }
      });
      csvRows.push(row.join(','));
    });

    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulsepoint-incidents-${agencyCode}-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PulsePoint Incident Scraper
          </h1>
          <p className="text-gray-600 mb-8">
            Enter an agency code to fetch and download incident data
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="agency-code" className="block text-sm font-medium text-gray-700 mb-2">
                Agency Code
              </label>
              <input
                type="text"
                id="agency-code"
                value={agencyCode}
                onChange={(e) => setAgencyCode(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter agency code (e.g., 1441)"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFetch}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : 'Fetch Incidents'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {incidents && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download JSON
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Active Incidents</h3>
                <p className="text-gray-600">{incidents.active.length} active incidents</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Incidents</h3>
                <p className="text-gray-600">{incidents.recent.length} recent incidents</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
