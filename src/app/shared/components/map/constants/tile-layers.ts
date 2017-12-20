import {Injectable} from '@angular/core';
export const TILE_LAYERS = {
  osmLight: {
    name: 'osmLight',
    active: true,
    label: 'OSM Light',
    url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    maxZoom: 18,
    attribution: '&copy;<a href="https://carto.com/attribution">cartoDB</a>',
    image: 'assets/img/map-tiles/esri_osm_light.png'
  },

  googleStreetsBaseMap: {
    name: 'googleStreetsBaseMap',
    active: false,
    label: 'Esri WorldStreetMap',
    maxZoom: 18,
    url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    image: 'assets/img/map-tiles/esri_street_map.png'
  },

  googleHybrid: {
    name: 'googleHybrid',
    active: false,
    label: 'Earth Imagery',
    maxZoom: 18,
    url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    image: 'assets/img/map-tiles/esri_world_imagery.png'
  },

  OpenMapSurfer: {
    name: 'OpenMapSurfer',
    active: false,
    label: 'Map Surfer',
    maxZoom: 18,
    url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
    attribution: '&copy; giscience',
    image: 'assets/img/map-tiles/opne_surfer.png'
  }
  ,
  DarkMatter: {
    name: 'DarkMatter',
    active: false,
    label: 'OSM Dark',
    maxZoom: 18,
    url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; CartoDB',
    image: 'assets/img/map-tiles/dar-osm.png'
  }
  ,
  OpenTopoMap: {
    name: 'OpenTopoMap',
    active: false,
    label: 'Topography Map',
    maxZoom: 18,
    url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; SRTM',
    image: 'assets/img/map-tiles/topo.png'
  }

  ,
  OSMHOT: {
    name: 'OSMHOT',
    active: false,
    label: 'OSM HOT',
    maxZoom: 18,
    url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OSM',
    image: 'assets/img/map-tiles/osm_hot.png'
  }

  ,
  BlackAndWhite: {
    name: 'BlackAndWhite',
    active: false,
    label: 'OSM Black & White',
    maxZoom: 18,
    url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    attribution: '&copy; OSM',
    image: 'assets/img/map-tiles/black_and_white.png'
  }

  ,
  StamenToner: {
    name: 'StamenToner',
    active: false,
    label: 'Stamen Toner Background',
    maxZoom: 18,
    url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    attribution: '&copy; STAMEN',
    image: 'assets/img/map-tiles/stamen-toner.png'
  }


};



@Injectable()
export class TileLayers {
  getTileLayer(tileLayerId) {
    const tileLayer = TILE_LAYERS[tileLayerId];
    if (tileLayerId == null){
      return null;
    }
    return tileLayer ? tileLayer : TILE_LAYERS['osmLight'];
  }
}
