import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';
import {ApplicationState} from '../../store/reducers';
import {Store} from '@ngrx/store';
import * as orgunitActions from '../../store/actions/orgunits.actions';
import {DataService} from './data.service';
import {Subject} from 'rxjs/Subject';
import * as _ from 'lodash';

@Injectable()
export class OrgUnitService {

  nodes: any[] = null;
  orgunit_levels: any[] = [];
  user_orgunits: any[] = [];
  orgunit_groups: any[] = [];
  initial_orgunits: any[] = [];
  user_information: any = null;
  private _nodes = new Subject<any>();
  constructor(
    private http: HttpClientService,
    private store: Store<ApplicationState>,
    private dataService: DataService
  ) { }

  getNodes(): Observable<any> {
    return this._nodes.asObservable();
  }

  // Get current user information
  getUserInformation (priority = null) {
    const url = (priority === false) ?
      'me.json?fields=dataViewOrganisationUnits[id,name,level],organisationUnits[id,name,level]' :
      'me.json?fields=organisationUnits[id,name,level]';
    return Observable.create(observer => {
      if (this.user_information !== null) {
        observer.next(this.user_information);
        observer.complete();
      }else {
        this.dataService.getUserInformation()
          .subscribe((useInfo) => {
              this.user_information = useInfo;
              observer.next(this.user_information);
              observer.complete();
            },
            error => {
              observer.error('some error occur');
            });
      }
    });
  }


  getuserOrganisationUnitsWithHighestlevel(level, userOrgunits) {
    const orgunits = [];
      if (!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')) {
        userOrgunits.organisationUnits.forEach((orgunit) => {
          if ( orgunit.level === level ) {
            orgunits.push(orgunit.id);
          }
        });
      }else {
        if (userOrgunits.dataViewOrganisationUnits.length === 0) {
          userOrgunits.organisationUnits.forEach((orgunit) => {
            if ( orgunit.level === level ) {
              orgunits.push(orgunit.id);
            }
          });
        }else {
          level = userOrgunits.dataViewOrganisationUnits[0].level;
          userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
            if ( orgunit.level === level ) {
              orgunits.push(orgunit.id);
            }
          });
        }
      }
    return orgunits;
  }

  /**
   * get the highest level among organisation units that user belongs to
   * @param userOrgunits
   * @returns {any}
   */
  getUserHighestOrgUnitlevel(userOrgunits) {
    let level: any;
    const orgunits = [];
    if (!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')) {
      level = userOrgunits.organisationUnits[0].level;
      userOrgunits.organisationUnits.forEach((orgunit) => {
        if ( orgunit.level <= level ) {
          level = orgunit.level;
        }
      });
    }else {
      if (userOrgunits.dataViewOrganisationUnits.length === 0) {
        level = userOrgunits.organisationUnits[0].level;
        userOrgunits.organisationUnits.forEach((orgunit) => {
          if ( orgunit.level <= level ) {
            level = orgunit.level;
          }
        });
      }else {
        level = userOrgunits.dataViewOrganisationUnits[0].level;
        userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
          if ( orgunit.level <= level ) {
            level = orgunit.level;
          }
        });
      }

    }
    return level;
  }

  /**
   * get the list of user orgunits as an array
   * @param userOrgunits
   * @returns {any}
   */
  getUserOrgUnits(userOrgunits) {
    const orgunits = [];
    if (!userOrgunits.hasOwnProperty('dataViewOrganisationUnits')) {
      userOrgunits.organisationUnits.forEach((orgunit) => {
        orgunits.push(orgunit);
      });
    }else {
      if (userOrgunits.dataViewOrganisationUnits.length === 0) {
        userOrgunits.organisationUnits.forEach((orgunit) => {
          orgunits.push(orgunit);
        });
      }else {
        userOrgunits.dataViewOrganisationUnits.forEach((orgunit) => {
          orgunits.push(orgunit);
        });
      }
    }
    this.store.dispatch(new orgunitActions.DoneLoadingUserOrganisationUnits( orgunits ));
    return orgunits;
  }

  prepareOrgunits(priority = null) {
    this.getOrgunitLevelsInformation()
      .subscribe(
        (data: any) => {
          // identify currently logged in usser
          this.getUserInformation(priority).subscribe(
            userOrgunit => {
              const level = this.getUserHighestOrgUnitlevel( userOrgunit );
              const all_levels = data.pager.total;
              const orgunits = this.getuserOrganisationUnitsWithHighestlevel( level, userOrgunit );
              const use_level = parseInt(all_levels) - (parseInt(level) - 1);
              // load inital orgiunits to speed up loading speed
              this.getInitialOrgunitsForTree(orgunits).subscribe(
                (initial_data) => {
                  // after done loading initial organisation units now load all organisation units
                  const fields = this.generateUrlBasedOnLevels(use_level);
                  this.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                    items => {
                      const organisationunits = this.sortOrganisationUnitTree([
                        {
                          ...items[0],
                          isExpanded: true
                        },
                        ...items.slice(1)
                      ]);
                      this._nodes.next(organisationunits);
                    },
                    error => {
                      console.error('something went wrong while fetching Organisation units', error);
                    }
                  );
                },
                error => {
                  console.error('something went wrong while fetching Organisation units', error);
                }
              );

            }
          );
        }
      );
    this.getOrgunitGroups().subscribe( groups => {//noinspection TypeScriptUnresolvedVariable
      this.orgunit_groups = groups;
    });
  }

  sortOrganisationUnitTree(organisationUnits: any[]) {
    return _.map(_.sortBy(organisationUnits, 'name'), (orgUnit) => {
      return orgUnit.children ? {
        ...orgUnit,
        children: this.sortOrganisationUnitTree(orgUnit.children)
      } : orgUnit;
    });
  }

  // Generate Organisation unit url based on the level needed
  generateUrlBasedOnLevels (level) {
    let childrenLevels = '[]';
    for (let i = 1; i < level + 1; i++) {
      childrenLevels = childrenLevels.replace('[]', '[id,name,level,parent[id,name],children[]]');
    }
    let new_string = childrenLevels.substring(1);
    new_string = new_string.replace(',children[]]', '');
    return new_string;
  }

  // Get system wide settings
  getOrgunitLevelsInformation () {
    return Observable.create(observer => {
      if (this.orgunit_levels.length !== 0) {
        observer.next(this.orgunit_levels);
        observer.complete();
      }else {
        this.http.get('organisationUnitLevels.json?fields=id,name,level&order=level:asc')
          .subscribe((levels: any) => {
            this.orgunit_levels = levels;
            this.store.dispatch(new orgunitActions.DoneLoadingOrganisationUnitLevels(
              levels.organisationUnitLevels
            ));
            observer.next(this.orgunit_levels);
            observer.complete();
          },
          error => {
            observer.error('some error occur');
          });
      }
    });
  }

  // Get organisation unit groups information
  getOrgunitGroups () {
    return Observable.create(observer => {
      if (this.orgunit_groups.length !== 0) {
        observer.next(this.orgunit_groups);
        observer.complete();
      }else {
        this.http.get('organisationUnitGroups.json?fields=id,name&paging=false')
          .subscribe((groups: any) => {
              this.orgunit_groups = groups.organisationUnitGroups;
              this.store.dispatch(new orgunitActions.DoneLoadingOrganisationUnitGroups(this.orgunit_groups ));
              observer.next(this.orgunit_groups);
              observer.complete();
            },
            error => {
              observer.error('some error occur');
            });
      }
    });
  }

  // Get system wide settings
  getAllOrgunitsForTree (fields) {
    return this.http.get('organisationUnits.json?filter=level:eq:1&paging=false&fields=' + fields);
  }

  // Get orgunit for specific
  getAllOrgunitsForTree1 (fields = null, orgunits = null) {
    return Observable.create(observer => {
      if (this.nodes != null) {
        this.store.dispatch(new orgunitActions.DoneLoadingOrganisationUnitItem());
        observer.next(this.nodes);
        observer.complete();
      } else {
        this.http.get('organisationUnits.json?fields=' + fields + '&filter=id:in:[' + orgunits.join(',') + ']&paging=false')
          .subscribe((nodes: any) => {
            this.nodes = nodes.organisationUnits;
            this.store.dispatch(new orgunitActions.DoneLoadingOrganisationUnits( this.nodes ));
            this.store.dispatch(new orgunitActions.DoneLoadingOrganisationUnitItem());
            observer.next(this.nodes);
            observer.complete();
          }, error => {
            observer.error('some error occured');
          });
      }
    });

  }

  // Get initial organisation units to speed up things during loading
  getInitialOrgunitsForTree (orgunits) {
    return Observable.create(observer => {
      if (this.initial_orgunits != null) {
        observer.next(this.initial_orgunits);
        observer.complete();
      } else {
        this.http.get('organisationUnits.json?fields=id,name,level,children[id,name]&filter=id:in:[' + orgunits.join(',') + ']&paging=false')
          .subscribe((nodes: any) => {
            this.initial_orgunits = nodes.organisationUnits;
            observer.next(this.initial_orgunits);
            observer.complete();
          }, error => {
            observer.error('some error occured');
          });
      }
    });
  }


}


