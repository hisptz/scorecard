# # Angular4 DHIS map module
This is angular 4 module for map visualization to be used in dhis2 apps
# Installation

This component assumes that the angular app is created using [angular cli](https://cli.angular.io/).

To use this module add it as git submodule on your working directory (app directory for ng2/4 project) as follows:

`git submodule add git@github.com:hisptz/map-module.git src/app/map`

### Using Submodules

In order to fill in the submodule’s path with the files from the external repository, you must first initialize the submodules and then update them.

`git submodule init`

`git submodule update`

For more about git submodules click [here](https://chrisjean.com/git-submodules-adding-using-removing-and-updating/)

# Using menu module

In order to use menu module, import the module in your app.module.ts file as follows;

```
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MapModule //Map module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
``` 

In your app component, add map component as follows;

`<app-map [visualizationObject]="visualizationObject"></app-map>
`

The accepted formatt for visualization object is of the following format



```

{
  "id": "",
  "name": "",
  "type": "MAP",
  "created": "",
  "lastUpdated": null,
  "shape": "NORMAL",
  "dashboardId": "",
  "subtitle": "",
  "description": "",
  "details": {
    "loaded": true,
    "hasError": false,
    "errorMessage": "",
    "appKey": null,
    "hideCardBorders": false,
    "showCardHeader": true,
    "showCardFooter": true,
    "showChartOptions": true,
    "showFilter": true,
    "cardHeight": "490px",
    "itemHeight": "465px",
    "fullScreen": false,
    "type": "MAP",
    "currentVisualization": "MAP",
    "favorite": {
      "id": "O6hcYqG3dsh",
      "type": "map"
    },
    "externalDimensions": {},
    "filters": [],
    "layouts": [],
    "analyticsStrategy": "normal",
    "rowMergingStrategy": "normal",
    "userOrganisationUnit": [],
    "description": null,
    "basemap": "osmLight",
    "zoom": 6,
    "latitude": -6.400000097863488,
    "longitude": 34.91240000000003,
    "interpretations": [
      {
        "id": "SBPEKakCL87",
        "interpretations": []
      },
      {
        "id": "xVk4MiPXeNB",
        "interpretations": []
      }
    ],
    "mapConfiguration": {
      "id": "",
      "name": "",
      "subtitle": null,
      "basemap": "osmLight",
      "zoom": 6,
      "latitude": -6.400000097863488,
      "longitude": 34.91240000000003
    }
  },
  "layers": [
    {
      "settings": {
        "id": "SBPEKakCL87",
        "name": "",
        "method": 2,
        "labels": false,
        "displayName": "",
        "labelFontColor": "#000000",
        "layer": "thematic1",
        "labelFontStyle": "normal",
        "radiusHigh": 15,
        "eventClustering": false,
        "colorLow": "ff0000",
        "opacity": 0.8,
        "colorScale": "",
        "parentLevel": 0,
        "parentGraphMap": {},
        "labelFontSize": "11px",
        "colorHigh": "00ff00",
        "completedOnly": false,
        "eventPointRadius": 0,
        "hidden": false,
        "classes": 5,
        "labelFontWeight": "normal",
        "radiusLow": 5,
        "attributeDimensions": [],
        "translations": [],
        "interpretations": [],
        "columns": [],
        "dataElementDimensions": [],
        "categoryDimensions": [],
        "programIndicatorDimensions": [],
        "attributeValues": [],
        "dataDimensionItems": [],
        "filters": [],
        "rows": [],
        "categoryOptionGroups": [],
        "geoFeature": []
      }
    }
  ]
}


```

# Update menu Submodule

If you want to pull new changes form menu repository, do as follows

1. Change to map module directory

`cd src/app/map`

2. Pull new changes from the repository for the stable branch (master)

`git pull origin master`

