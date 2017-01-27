import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "../costants";

@Injectable()
export class OrgUnitService {

  nodes: any[] = null;
  constructor(private http: Http, private constant: Constants) { }

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

  // Get current user information
  getUserInformation () {
    return this.http.get(this.constant.root_dir + 'api/me.json?fields=dataViewOrganisationUnits[id,level],organisationUnits[id,level]')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  getuserOrganisationUnitsWithHighestlevel(level,userOrgunits){
    let orgunits = [];
    if(userOrgunits.dataViewOrganisationUnits.length == 0){
      userOrgunits.organisationUnits.forEach((orgunit) => {
        if ( orgunit.level == level ){
          orgunits.push(orgunit.id);
        }
      })
    }else{
      level = userOrgunits.dataViewOrganisationUnits[0].level;
      userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
        if ( orgunit.level == level ){
          orgunits.push(orgunit.id);
        }
      })
    }
    return orgunits;
  }

  getUserHighestOrgUnitlevel(userOrgunits){
    let level: any;
    let orgunits = [];
    if(userOrgunits.dataViewOrganisationUnits.length == 0){
      level = userOrgunits.organisationUnits[0].level;
      userOrgunits.organisationUnits.forEach((orgunit) => {
        if ( orgunit.level <= level ){
          level = orgunit.level;
        }
      })
    }else{
      level = userOrgunits.dataViewOrganisationUnits[0].level;
      userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
        if ( orgunit.level <= level ){
          level = orgunit.level;
        }
      })
    }
    return level;
  }

  prepareOrgunits(){
    this.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          this.getUserInformation().subscribe(
            userOrgunit => {
              let level = this.getUserHighestOrgUnitlevel(userOrgunit);
              let all_levels = data.pager.total;
              let orgunits = this.getuserOrganisationUnitsWithHighestlevel(level,userOrgunit);
              let use_level = parseInt(all_levels) - (parseInt(level) - 1);
              let fields = this.generateUrlBasedOnLevels(use_level);
              this.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                items => {
                  //noinspection TypeScriptUnresolvedVariable
                  this.nodes = items.organisationUnits;
                }
              )
            }
          )
        }
      );
  }


  // Generate Organisation unit url based on the level needed
  generateUrlBasedOnLevels (level){
    let childrenLevels = "[]";
    for (let i = 1; i < level+1; i++) {
      childrenLevels = childrenLevels.replace("[]", "[id,name,children[]]")
    }
    let new_string = childrenLevels.substring(1);
    new_string = new_string.replace(",children[]]","");
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

  // Get orgunit for specific
  getAllOrgunitsForTree1 (fields,orgunits) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits.json?fields=' + fields +'&filter=id:in:['+orgunits.join(",")+']&paging=false')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get initial organisation units to speed up things during loading
  getInitialOrgunitsForTree (orgunits) {
    return this.http.get(this.constant.root_dir + 'api/organisationUnits.json?fields=id,name,children[id,name]&filter=id:in:['+orgunits.join(",")+']&paging=false')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // populateOrgunit ()  {
  //   this.getOrgunitLevelsInformation()
  //     .subscribe(
  //       (data: any) => {
  //         let fields = this.generateUrlBasedOnLevels( data.pager.total );
  //         this.getAllOrgunitsForTree( fields )
  //           .subscribe(
  //             ( orgUnits: any ) => {
  //               this.nodes = orgUnits.organisationUnits;
  //             },
  //             error => {
  //               console.log('something went wrong while fetching Organisation units')
  //             }
  //           );
  //       },
  //       error => {
  //         console.log('something went wrong while fetching Organisation units ')
  //       }
  //     );
  // }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }


}


