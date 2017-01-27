import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "./costants";

@Injectable()
export class DataService {

  user: any = null;
  constructor(private http: Http, private constant: Constants) { }

  nodes: any = null;
  /////////OrgUnit Tree items/////////////////
  generateUrlBasedOnLevels (level: number): string{
    let childrenLevels = "[]";
    for (let i = 1; i < level+1; i++) {
      childrenLevels = childrenLevels.replace("[]", "[id,level,name,children[]]")
    }
    let new_string = childrenLevels.substring(1);
    new_string = new_string.replace(",children[]","");
    return new_string;
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
  prepareOrganisationUnitTree(organisationUnit) {
    if (organisationUnit.children) {
      organisationUnit.children.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        // a must be equal to b
        return 0;
      })
      organisationUnit.children.forEach((child) => {
        this.prepareOrganisationUnitTree(child)
      })
    }
  }

  //sorting an array of object
  sortArrOfObjectsByParam (arrToSort: Array<any>, strObjParamToSortBy: string, sortAscending: boolean = true) {
    if( sortAscending == undefined ) sortAscending = true;  // default to true
    // if( arrToSort ){
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
    // }

  }
  // Get system wide settings
  getOrgunitDetails (orgunit) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits/'+orgunit+'.json?fields=id,name,children[id,name]')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  getIndicatorsRequest ( orgunits: string, period:string, indicator:string ) {
    return this.http.get(this.constant.root_dir + 'api/analytics.json?dimension=dx:'+indicator+'&dimension=ou:'+orgunits+'&dimension=pe:'+period+'&displayProperty=NAME')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }


  getIndicatorData ( orgunitId ,period, indicatorsObject) {
    // console.log(indicatorsObject)
    let return_object: 0;
    for ( let row of indicatorsObject.rows ) {
      if( row[1] == orgunitId && row[2] == period ){
        return_object =  row[3];
      }
    }
    return return_object
  }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }

}
