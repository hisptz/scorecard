import { Injectable } from '@angular/core';
import {HttpClientService} from './http-client.service';
import {Observable} from "rxjs/Observable";

export interface EventData {
  id: string;
  name: string;
  indicators: any;
}

@Injectable()
export class EventDataService {

  events: EventData[] = [];
  constructor(private http: HttpClientService) {  }

  // get all indicator groups
  loadAll(): Observable<any> {
    return this.http.get('programs.json?fields=id,name&paging=false');
  }

  load(id: string ) {
    return this.http.get('programDataElements.json?program=${id}&fields=dimensionItem%7Crename(id),name,valueType&paging=false&filter=valueType:eq:INTEGER_ZERO_OR_POSITIVE');
  }

  getAll(): Observable<EventData[]> {
    return new Observable((observ) => {
      if ( this.events.length === 0) {
        this.http.get('programs.json?fields=id,name&paging=false').subscribe((results: any) => {
          const progamsLength = results.programs.length;
          let counter = 0;
          results.programs.forEach((event) => {
            this.load(event.id).subscribe((dataelements: any) => {
              counter++;
              this.events.push({
                ...event,
                indicators: dataelements.programDataElements
              });
              if (counter === progamsLength) {
                observ.next(this.events);
                observ.complete();
              }
            });
          });
        }, (error) => {
          observ.next([]);
        });
      } else {
        // this.store.dispatch( new SetFunctionsAction( this.functions ) );
        observ.next(this.events);
        observ.complete();
      }

    });

  }

}
