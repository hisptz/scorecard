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

    private _indicators: Indicator[];
    private baseUrl: string;

    constructor(private http: Http, private costant: Constants) {
      this.baseUrl = this.costant.root_dir;
    }
}
