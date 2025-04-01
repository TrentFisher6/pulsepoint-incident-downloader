export interface Agency {
  agencyid: string;
  agency_initials: string;
  agencyname: string;
  short_agencyname: string;
}

export interface Unit {
  UnitID: string;
  PulsePointDispatchStatus: string;
}

export interface Incident {
  ID: string;
  CallReceivedDateTime: string;
  ClosedDateTime: string | null;
  UnitClearedDateTime: string | null;
  PulsePointIncidentCallType: string;
  incident_type?: string;
  Latitude: string;
  Longitude: string;
  coords?: [number, number];
  uid?: string;
  Unit?: Unit[];
  FullDisplayAddress?: string;
}

export interface Incidents {
  active: Incident[];
  recent: Incident[];
}

export interface IncidentTypes {
  [key: string]: string;
} 