import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Http} from "@angular/http";
import {Constants} from "../costants";
import 'rxjs/add/operator/map';
import {runInContext} from "vm";

export interface Indicator {
  id: string;
  name: string;
  indicatorType: any;
}

  @Injectable()
export class IndicatorService {

    indicators: Observable<Indicator[]>;
    private _indicators: BehaviorSubject<Indicator[]>;
    private baseUrl: string;
    private dataStore: {
      indicators: Indicator[]
    };

    constructor(private http: Http, private costant: Constants) {
      this.dataStore = { indicators: [] };
      this.baseUrl = this.costant.root_dir;
      this._indicators = <BehaviorSubject<Indicator[]>>new BehaviorSubject([]);
      this.indicators = this._indicators.asObservable();
    }

    // get all indicator groups
    loadAll() {
      this.http.get(this.baseUrl+"api/indicators.json?fields=id,name,indicatorType[id,name]&paging=false").map(response => response.json()).subscribe(data => {
        this.dataStore.indicators = [];
        console.log(data)
        for (let indicator of data.indicators) {
          this.dataStore.indicators.push({id:indicator.id, name:indicator.name, indicatorType: indicator.indicatorType});
        }
        this._indicators.next(Object.assign({}, this.dataStore).indicators);
      }, error => console.log('Could not load scorecards.'));
    }

    loadFromGroup(indicators: Indicator[] ) {
      let notFound = true;
        for ( let indicator of indicators ){
          this.dataStore.indicators.forEach((item, index) => {
            if (item.id === indicator.id ) {
              notFound = false;
            }
          });

          if (notFound) {
            this.dataStore.indicators.push(indicator);
          }
        }


        this._indicators.next(Object.assign({}, this.dataStore).indicators);
    }
}
