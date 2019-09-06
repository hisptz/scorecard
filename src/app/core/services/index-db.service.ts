import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Observable } from 'rxjs';

export interface IndexDbConfig {
  namespace: string;
  version: number;
  models: { [name: string]: string };
}

export class IndexDbServiceConfig implements IndexDbConfig {
  namespace = 'db';
  version = 1;
  models = {};
}
@Injectable({
  providedIn: 'root'
})
export class IndexDbService extends Dexie {
  constructor(config: IndexDbServiceConfig) {
    super(config.namespace);
    this.version(config.version).stores(config.models);
  }

  getAll(schemaName: string): Observable<any> {
    return new Observable(observer => {
      this.table(schemaName)
        .toArray()
        .then(
          (dataArray: any[]) => {
            observer.next(dataArray);
            observer.complete();
          },
          (error: any) => {
            observer.next(error);
          }
        );
    });
  }

  saveBulk(schemaName: string, data: any[]): Observable<any[]> {
    return new Observable(observer => {
      this.table(schemaName)
        .bulkPut(data)
        .then(
          () => {
            observer.next(data);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }
}
