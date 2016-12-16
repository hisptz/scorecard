import { Injectable } from '@angular/core';

import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import {Constants} from "../costants";

@Injectable()
export class FilterService {

  constructor(private http: Http, private constant: Constants) { }

}
