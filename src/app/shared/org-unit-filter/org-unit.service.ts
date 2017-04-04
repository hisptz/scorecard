import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable, Observer} from 'rxjs';

@Injectable()
export class OrgUnitService {

  nodes: any[] = null;
  orgunit_levels:any = null;
  user_orgunits:any[] = [];
  orgunit_groups:any[] = [];
  initial_orgunits:any[] = [];
  user_information:any = null;
  constructor(private http: Http) { }

  // Get current user information
  getUserInformation (priority="report") {
    return Observable.create(observor => {
      if(this.user_information != null ){
        observor.next(this.user_information);
        observor.complete();
      }else{
        if(priority == "report"){
          this.http.get('../../../api/me.json?fields=dataViewOrganisationUnits[id,name,level,children[id,name]],organisationUnits[id,name,level,children[id,name]]')
            .map((response: Response) => response.json())
            .catch( this.handleError )
            .subscribe(user => {
              this.user_information = user;
              observor.next(this.user_information);
              observor.complete();
            },error=>{
              observor.error("Error occurred when fetching user information")
            });
        }else{
          this.http.get('../../../api/me.json?fields=organisationUnits[id,name,level,children[id,name]]')
            .map((response: Response) => response.json())
            .catch( this.handleError )
            .subscribe(user => {
              this.user_information = user;
              observor.next(this.user_information);
              observor.complete();
            },error=>{
              observor.error("Error occurred when fetching user information")
            });
        }
      }
    });

  }

  getuserOrganisationUnitsWithHighestlevel(level,userOrgunits){
    let orgunits = [];
      if(!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')){
        userOrgunits.organisationUnits.forEach((orgunit) => {
          if ( orgunit.level == level ){
            orgunits.push(orgunit.id);
          }
        })
      }
      else{
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
    if(!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')){
      level = userOrgunits.organisationUnits[0].level;
      userOrgunits.organisationUnits.forEach((orgunit) => {
        if ( orgunit.level <= level ){
          level = orgunit.level;
        }
      })
    }else{
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
    if(!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')){
      userOrgunits.organisationUnits.forEach((orgunit) => {
        orgunits.push(orgunit);
      })
    }else{
      if(userOrgunits.dataViewOrganisationUnits.length == 0){
        userOrgunits.organisationUnits.forEach((orgunit) => {
          orgunits.push(orgunit);
        })
      }else{
        userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
          orgunits.push(orgunit);
        })
      }
    }
    return orgunits;
  }

  prepareOrgunits(priority=null){
    this.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          this.getUserInformation(priority).subscribe(
            userOrgunit => {
              let level = this.getUserHighestOrgUnitlevel(userOrgunit);
              let all_levels = data.pager.total;
              let orgunits = this.getuserOrganisationUnitsWithHighestlevel(level,userOrgunit);
              let use_level = parseInt(all_levels) - (parseInt(level) - 1);
              let fields = this.generateUrlBasedOnLevels(use_level);
              this.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                items => {
                  //noinspection TypeScriptUnresolvedVariable
                  this.nodes = items;
                }
              )
            }
          )
        }
      );
    this.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable

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
    return Observable.create(observer => {
      if(this.orgunit_levels != null){
        observer.next(this.orgunit_levels);
        observer.complete();
      }else{
        this.http.get('../../../api/organisationUnitLevels.json?fields=id,name,level&order=level:asc')
          .map((response: Response) => response.json())
          .catch( this.handleError )
          .subscribe((levels) => {
            this.orgunit_levels = levels;
            observer.next(this.orgunit_levels);
            observer.complete();
          },
          error=>{
            observer.error("some error occur")
          })
      }
    })
  }

  // Get organisation unit groups information
  getOrgunitGroups () {
    return Observable.create(observer => {
      if(this.orgunit_groups.length != 0){
        observer.next(this.orgunit_groups);
        observer.complete();
      }else{
        this.http.get('../../../api/organisationUnitGroups.json?fields=id,name&paging=false')
          .map((response: Response) => response.json())
          .catch( this.handleError )
          .subscribe((groups) => {
              this.orgunit_groups = groups.organisationUnitGroups;
              console.log(this.orgunit_groups)
              observer.next(this.orgunit_groups);
              observer.complete();
            },
            error=>{
              observer.error("some error occur")
            })
      }
    })
  }

  // Get system wide settings
  getAllOrgunitsForTree (fields) {
    return this.http.get('../../../api/organisationUnits.json?filter=level:eq:1&paging=false&fields=' + fields)
      .map((response: Response) => response.json())
      .catch( this.handleError );
  }

  // Get orgunit for specific
  getAllOrgunitsForTree1 (fields = null, orgunits = null) {
    return Observable.create(observer => {
      if(this.nodes != null) {
        observer.next(this.nodes);
        observer.complete();
      } else {
        this.http.get('../../../api/organisationUnits.json?fields=' + fields +'&filter=id:in:['+orgunits.join(",")+']&paging=false')
          .map((response: Response) => response.json())
          .catch( this.handleError )
          .subscribe(nodes => {
            this.nodes = nodes.organisationUnits;
            observer.next(this.nodes);
            observer.complete();
          },error => {
            observer.error("some error occured")
          })
      }
    })

  }

  // Get initial organisation units to speed up things during loading
  getInitialOrgunitsForTree (orgunits) {
    return Observable.create(observer => {
      if(this.initial_orgunits != null) {
        observer.next(this.initial_orgunits);
        observer.complete();
      } else {
        this.http.get('../../../api/organisationUnits.json?fields=id,name,children[id,name]&filter=id:in:['+orgunits.join(",")+']&paging=false')
          .map((response: Response) => response.json())
          .catch( this.handleError )
          .subscribe(nodes => {
            this.initial_orgunits = nodes.organisationUnits;
            observer.next(this.initial_orgunits);
            observer.complete();
          },error => {
            observer.error("some error occured")
          })
      }
    });
  }

  // Handling error
  handleError (error: any) {
    return Observable.throw( error );
  }


}


