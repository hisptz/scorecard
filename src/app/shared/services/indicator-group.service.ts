import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Http} from "@angular/http";
import {Constants} from "../costants";
import 'rxjs/add/operator/map';
import {IndicatorService} from "./indicator.service";

export interface IndicatorGroup {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class IndicatorGroupService {

  indicatorGroups: Observable<IndicatorGroup[]>;
  private _indicatorGroups: BehaviorSubject<IndicatorGroup[]>;
  private baseUrl: string;
  private dataStore: {
    indicatorGroups: IndicatorGroup[]
  };

  constructor(private http: Http, private costant: Constants, private indicatorService: IndicatorService) {
    this.dataStore = { indicatorGroups: [] };
    this.baseUrl = this.costant.root_dir;
    this._indicatorGroups = <BehaviorSubject<IndicatorGroup[]>>new BehaviorSubject([]);
    this.indicatorGroups = this._indicatorGroups.asObservable();
  }

  // get all indicator groups
  loadAll() {
    this.http.get(this.baseUrl+"api/indicatorGroups.json?fields=id,name&paging=false").map(response => response.json()).subscribe(data => {
      this.dataStore.indicatorGroups = [];
      for (let group of data.indicatorGroups) {
        this.dataStore.indicatorGroups.push({id:group.id, name:group.name, indicators: []});
      }
      this._indicatorGroups.next(Object.assign({}, this.dataStore).indicatorGroups);
    }, error => console.log('Could not load scorecards.'));
  }

  load(id: string ) {
    this.http.get(`${this.baseUrl}/api/indicatorGroups/${id}.json?fields=id,name,indicators[id,name,indicatorType[id,name]]`).map(response => response.json()).subscribe(data => {
      let notFound = true;
      this.indicatorService.loadFromGroup(data.indicators);
      this.dataStore.indicatorGroups.forEach((item, index) => {
        if (item.id === id) {
          this.dataStore.indicatorGroups[index]['indicators'] = data.indicators;
          notFound = false;
        }
      });

      if (notFound) {
        this.dataStore.indicatorGroups.push({ id: data.id, name: data.name, indicators: data.indicators });
      }

      this._indicatorGroups.next(Object.assign({}, this.dataStore).indicatorGroups);
    }, error => console.log('Could not load Indicator Group.'));
  }
}
