import { Agency, Incident, Incidents, IncidentTypes } from './types';

export class Scraper {
  private agencies: { [key: string]: Agency } = {};
  private incidentTypes: IncidentTypes = {};

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load incident types
      const response = await fetch('/incident_types.json');
      this.incidentTypes = await response.json();

      // Load agencies
      const agenciesResponse = await fetch('/api/agencies');
      const agenciesData = await agenciesResponse.json();
      this.agencies = agenciesData.agencies.reduce((acc: { [key: string]: Agency }, agency: Agency) => {
        acc[agency.agencyid] = agency;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to initialize scraper:', error);
    }
  }

  private str2time(s: string): Date {
    return new Date(s);
  }

  private fixDict(d: any): any {
    if (d === 'null') return null;
    if (d instanceof Date) return d;
    if (typeof d === 'object' && d !== null) {
      if (Array.isArray(d)) {
        return d.map(item => this.fixDict(item));
      }
      const result: any = {};
      for (const [k, v] of Object.entries(d)) {
        result[k] = this.fixDict(v);
      }
      return result;
    }
    return d;
  }

  private convertIncidents(iList: Incident[]): void {
    if (!Array.isArray(iList)) return;

    const conversions = ['CallReceivedDateTime', 'ClosedDateTime', 'UnitClearedDateTime'];
    iList.forEach(x => {
      conversions.forEach(c => {
        if (c in x && typeof x[c as keyof Incident] === 'string') {
          (x as any)[c] = this.str2time(x[c as keyof Incident] as string);
        }
      });

      if ('Unit' in x) {
        this.convertIncidents(x.Unit as Incident[]);
      }

      if ('PulsePointIncidentCallType' in x) {
        (x as any).incident_type = this.incidentTypes[x.PulsePointIncidentCallType];
      }

      if ('Latitude' in x && 'Longitude' in x) {
        (x as any).coords = [parseFloat(x.Latitude), parseFloat(x.Longitude)];
        (x as any).uid = x.ID;
      }
    });
  }

  private async agencyRawData(aId: string): Promise<any> {
    const response = await fetch(`/api/incidents?agency_id=${aId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  }

  async getIncidents(aId: string): Promise<Incidents> {
    try {
      const raw = await this.agencyRawData(aId);
      this.convertIncidents(raw.incidents.active);
      this.convertIncidents(raw.incidents.recent);
      const fixed = this.fixDict(raw);
      return fixed.incidents;
    } catch (error) {
      console.error('Failed to get incidents:', error);
      return { active: [], recent: [] };
    }
  }

  getAgency(name: string): Agency | null {
    const searchFields = ['ID', 'agency_initials', 'agencyname', 'short_agencyname'];
    
    // Exact match
    for (const agency of Object.values(this.agencies)) {
      for (const field of searchFields) {
        if (field in agency && String(agency[field as keyof Agency]).toLowerCase() === String(name).toLowerCase()) {
          return agency;
        }
      }
    }

    // Partial match
    for (const agency of Object.values(this.agencies)) {
      for (const field of searchFields) {
        if (field in agency) {
          const value = String(agency[field as keyof Agency]).toLowerCase();
          const search = String(name).toLowerCase();
          if (value.includes(search) || search.includes(value)) {
            console.log(`Using "${agency.agencyname}" instead!`);
            return agency;
          }
        }
      }
    }

    return null;
  }
} 