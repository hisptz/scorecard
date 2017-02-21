import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "../costants";

@Injectable()
export class OrgUnitService {

  nodes: any[] = null;
  orgunit_levels:any[] = [];
  user_orgunits:any[] = [];
  orgunit_groups:any[] = [];
  constructor(private http: Http, private constant: Constants) { }

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

  /**
   * get the highest level among organisation units that user belongs to
   * @param userOrgunits
   * @returns {any}
   */
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

  /**
   * get the list of user orgunits as an array
   * @param userOrgunits
   * @returns {any}
   */
  getUserOrgUnits(userOrgunits){
    let orgunits = [];
    if(userOrgunits.dataViewOrganisationUnits.length == 0){
      userOrgunits.organisationUnits.forEach((orgunit) => {
        orgunits.push(orgunit.id);
      })
    }else{
      userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
        orgunits.push(orgunit.id);
      })
    }
    return orgunits;
  }

  prepareOrgunits(){
    this.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          this.orgunit_levels = data.organisationUnitLevels;
          this.getUserInformation().subscribe(
            userOrgunit => {
              this.user_orgunits = this.getUserOrgUnits( userOrgunit );
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
    this.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
      this.orgunit_groups = groups.organisationUnitGroups
    });
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
    return this.http.get(this.constant.root_dir + 'api/organisationUnitLevels.json?fields=id,name,level&order=level:asc')
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get organisation unit groups information
  getOrgunitGroups () {
    return this.http.get(this.constant.root_dir + 'api/organisationUnitGroups.json?fields=id,name&paging=false')
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

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }


}


