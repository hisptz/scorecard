export interface Visualization {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  created: string;
  lastUpdated: string;
  shape: string;
  dashboardId: string;
  description: string;
  details: any;
  layers: any[];
  operatingLayers: any[];
}
