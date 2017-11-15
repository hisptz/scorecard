export interface MapObject {
  id: string;
  name: string;
  center: Array<number>;
  zoom: number;
  maxZoom: 18;
  minZoom: 2;
  zoomControl: true;
  scrollWheelZoom: false;
  layers: Array<any>;
  legendInterface: Array<any>;
}
