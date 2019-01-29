import {Injectable} from '@angular/core';
import {Observable } from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';

@Injectable()
export class OrgUnitService {

  orgunit_levels: any = [];

  constructor(private http: HttpClientService) {
  }


  // Get system wide settings
  getOrgunitLevelsInformation() {
    return Observable.create(observer => {
      if (this.orgunit_levels.length !== 0) {
        observer.next(this.orgunit_levels);
        observer.complete();
      } else {
        this.http.get('../../../api/organisationUnitLevels.json?fields=id,name,level&order=level:asc')
          .subscribe((levels) => {
              this.orgunit_levels = levels;
              observer.next(this.orgunit_levels);
              observer.complete();
            },
            error => {
              observer.error('some error occur');
            });
      }
    });
  }

}


