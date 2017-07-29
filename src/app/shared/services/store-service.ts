import { Injectable } from '@angular/core';
import {ApplicationState} from '../../store/application.state';
import {Action, Store} from '@ngrx/store';

@Injectable()
export class StoreService {

  constructor(private store: Store<ApplicationState>) { }

  public dispatch(action: Action) {
    this.store.dispatch(action);
  }

  public get ngrxStore(): Store<ApplicationState> {
    return this.store;
  }
}
