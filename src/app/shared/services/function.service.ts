import { Injectable } from '@angular/core';
import {HttpClientService} from './http-client.service';
import {Observable} from 'rxjs/Observable';
import {FunctionObject} from '../models/function-object';
import {User} from '../models/user';
import {FunctionParameters} from '../models/function-parameters';
import {Store} from '@ngrx/store';
import 'rxjs/add/observable/forkJoin';
import {ApplicationState} from '../../store/reducers';
import {LoadFunctionDone} from "../../store/actions/static-data.actions";

@Injectable()
export class FunctionService {

  constructor(
    private http: HttpClientService,
    private store: Store<ApplicationState>
  ) { }

  currentUser;
  functions: any = [];

  getAll() {
    return new Observable((observ) => {
      if ( this.functions.length === 0) {
        this.http.get('dataStore/functions').subscribe((results) => {
          const observable = [];
          results.forEach((id) => {
            observable.push(this.http.get('dataStore/functions/' + id));
          });
          Observable.forkJoin(observable).subscribe((responses: any) => {
            const functions = [];
            responses.forEach((response, index) => {
              functions.push(response);
            });
            this.functions = functions;
            this.store.dispatch( new LoadFunctionDone( functions ) );
            observ.next(functions);
            observ.complete();
          }, (error) => {
            this.store.dispatch( new LoadFunctionDone( [] ) );
            observ.error('no functions available');
          });
        }, (error) => {
          this.store.dispatch( new LoadFunctionDone( [] ) );
          observ.error('no functions available');
        });
      } else {
        // this.store.dispatch( new SetFunctionsAction( this.functions ) );
        observ.next(this.functions);
        observ.complete();
      }

    });

  }

  getAllFunctions() {
    this.getAll().subscribe( );
  }
  get(id) {
    return new Observable((observ) => {
      this.http.get('dataStore/functions/' + id).subscribe((func) => {
        observ.next(func);
        observ.complete();
      }, (error) => {

      });
    });

  }

  run(functionParameters: FunctionParameters, functionObject: FunctionObject) {
    return new Observable((observ) => {
      if (!this.isError(functionObject.function)) {
        try {
          functionParameters.error = (error) => {
            observ.error(error);
            observ.complete();
          };
          functionParameters.success = (results) => {
            observ.next(results);
            observ.complete();
          };
          functionParameters.progress = (results) => {

          };
          const execute = Function('parameters', functionObject.function);
          execute(functionParameters);
        }catch (e) {
          observ.error(e.stack);
          observ.complete();
        }
      }else {
        observ.error({message: 'Errors in the code.'});
        observ.complete();
      }
    });
  }

  isError(code) {
    let successError = false;
    let errorError = false;
    let progressError = false;
    const value = code.split(' ').join('').split('\n').join('').split('\t').join('');
    if (value.indexOf('parameters.success(') === -1) {
      successError = true;
    }
    if (value.indexOf('parameters.error(') === -1) {
      errorError = true;
    }
    if (value.indexOf('parameters.progress(') === -1) {
      progressError = true;
    }
    return successError || errorError;
  }

}
