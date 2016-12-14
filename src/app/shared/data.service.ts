import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "./costants";

@Injectable()
export class DataService {


  constructor(private http: Http, private constant: Constants) { }

  nodes: any = null;
  /////////OrgUnit Tree items/////////////////
  generateUrlBasedOnLevels (level: number){
    var fields: string;
    if ( level == 1 ) {
      fields = 'id,name';
    }else if ( level == 2 ) {
      fields = 'id,name,children[id,name]';
    }else if ( level == 3 ) {
      fields = 'id,name,children[id,name,children[id,name]]';
    }else if ( level == 4 ) {
      fields = 'id,name,children[id,name,children[id,name,children[id,name]]]';
    }else if ( level == 5 ) {
      fields = 'id,name,children[id,name,children[id,name,children[id,name,children[id,name]]]]';
    }

    return fields;
  }

  // Get system wide settings
  getOrgunitLevelsInformation () {
    return this.http.get(this.constant.root_dir + 'api/organisationUnitLevels.json?fields=id')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get system wide settings
  getAllOrgunitsForTree (fields) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits.json?filter=level:eq:1&paging=false&fields=' + fields)
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  populateOrgunit ()  {
    this.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          let fields = this.generateUrlBasedOnLevels( data.pager.total );
          this.getAllOrgunitsForTree( fields )
            .subscribe(
              ( orgUnits: any ) => {
                this.nodes = orgUnits.organisationUnits;
              },
              error => {
                console.log('something went wrong while fetching Organisation units')
              }
            );
        },
        error => {
          console.log('something went wrong while fetching Organisation units ')
        }
      );
  }

  //////////////////end of orgunit tree items////////////


  //sorting an array of object
  sortArrOfObjectsByParam (arrToSort: Array<any>, strObjParamToSortBy: string, sortAscending: boolean = true) {
    if( sortAscending == undefined ) sortAscending = true;  // default to true

    if( sortAscending ) {
      arrToSort.sort( function ( a, b ) {
        if( a[strObjParamToSortBy] > b[strObjParamToSortBy] ){
          return 1;
        }else{
          return -1;
        }
      });
    }
    else {
      arrToSort.sort(function (a, b) {
        if( a[strObjParamToSortBy] < b[strObjParamToSortBy] ){
          return 1;
        }else {
          return -1
        }
      });
    }
  }
  // Get system wide settings
  getOrgunitDetails (orgunit) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits/'+orgunit+'.json?fields=id,name,children[id,name]')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }

  getIndicatorsRequest ( orgunit, period, indicator ) {

    // let indicators = indicatorArray.join(';');
    return this.http.get(this.constant.root_dir + 'api/analytics.json?dimension=dx:'+indicator+'&dimension=ou:LEVEL-1;LEVEL-2&filter=pe:'+period+'&displayProperty=NAME')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }


  getDataValuesRequest( orgunit, period, dataset ) {
    return this.http.get(this.constant.root_dir + "api/dataValueSets.json?dataSet=" + dataset + "&period="+period+"&orgUnit=" + orgunit)
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  getIndicatorData ( orgunitId , indicatorsObject) {
    let return_object: 0;
    for ( let row of indicatorsObject.rows ) {
      if( row[1] == orgunitId ){
        return_object =  row[2];
      }
    }
    return return_object
  }

  getDataValue( dataElementId, dataValuesObject ) {
    let return_object: any = {};
    return_object['available'] = false;
    for ( let dataValue of dataValuesObject.dataValues ) {
      if( dataValue.dataElement == dataElementId ){
        return_object['available'] = true;
        return_object['data'] =  dataValue.value;
      }
    }
    return return_object
  }

}
