import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClientService} from './http-client.service';
import * as _ from 'lodash';

@Injectable()
export class UtilitiesService {

  constructor(private http: HttpClientService) {
  }

  getUniqueId(apiRootUrl): Observable<string> {
    return Observable.create(observer => {
      this.http.get(apiRootUrl + 'system/id.json?n=1')
        .subscribe(
          response => {
            observer.next(response['codes'][0]);
            observer.complete();
          }, error => observer.error(error))
    })
  }

  getHumanReadableFromRelativePeriod(relativePeriod): Array<string> {

    let humanReadable = [];
    humanReadable = relativePeriod;
    return humanReadable;
  }


  getISOFormatFromRelativePeriod(favourite): Array<string> {
    let isoFormat = [];
    let periodDimension = undefined;
    let newPeriodDimension = {dimension: 'pe', items: []};
    let periodIndex = null;
    let parentdimension = null;

    if (this._periodDimensionExist(favourite.rows)) {
      periodIndex = _.findIndex(favourite.rows, ['dimension', 'pe']);
      periodDimension = favourite.rows[periodIndex];
      parentdimension = 'rows';
    }

    if (this._periodDimensionExist(favourite.filters)) {
      periodIndex = _.findIndex(favourite.filters, ['dimension', 'pe']);
      periodDimension = favourite.filters[periodIndex];
      parentdimension = 'filters';
    }

    if (this._periodDimensionExist(favourite.columns)) {
      periodIndex = _.findIndex(favourite.columns, ['dimension', 'pe']);
      periodDimension = favourite.columns[periodIndex];
      parentdimension = 'columns';
    }

    if (periodDimension && favourite[parentdimension]) {
      newPeriodDimension = this._getNewDimentions(newPeriodDimension, periodDimension);
      favourite[parentdimension].splice(periodIndex, 1);
      favourite[parentdimension].push(newPeriodDimension);
    }

    return favourite;
  }

  private _getNewDimentions(dimentionTemplate, dimensionsObject) {
    const currentDate = new Date();

    const periodObject = {
      THIS_MONTH: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const stringMonth = month < 10 ? '0' + month : month + '';
          const thisMonth = year + stringMonth;
          const item = {
            id: thisMonth,
            dimensionItem: thisMonth,
            displayName: thisMonth,
            dimensionItemType: 'PERIOD'
          };
          return [item]
        }
      }, LAST_MONTH: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() - 1;
          const stringMonth = month < 10 ? '0' + month : month + '';
          const thisMonth = year + stringMonth;
          const item = {
            id: thisMonth,
            dimensionItem: thisMonth,
            displayName: thisMonth,
            dimensionItemType: 'PERIOD'
          };
          return [item]
        }
      }, LAST_3_MONTHS: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const items = [];
          for (let monthCount = 1; monthCount < 4; monthCount++) {
            items.push({
              id: year + '' + (month - monthCount),
              dimensionItem: year + '' + (month - monthCount),
              displayName: year + '' + (month - monthCount),
              dimensionItemType: 'PERIOD'
            })
          }
          return items;
        }
      }, THIS_YEAR: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const stringYear = year + '';
          const item = {
            id: stringYear,
            dimensionItem: stringYear,
            displayName: stringYear,
            dimensionItemType: 'PERIOD'
          };
          return [item]
        }
      }, LAST_YEAR: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          let workingYear = 0
          const backYears = 1;
          const items = [];
          for (let counter = backYears; counter >= 1; counter--) {
            workingYear = year - counter;
            items.push(
              {
                id: workingYear,
                dimensionItem: workingYear,
                displayName: workingYear,
                dimensionItemType: 'PERIOD'
              }
            )
          }

          return items
        }
      }, LAST_12_MONTHS: {
        getIso: () => {
          let year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          let workingMonth = month;
          const items = [];
          let monthString = '';
          for (let monthCount = 1; monthCount < 13; monthCount++) {
            if ((month - monthCount) < 10) {

              if ((month - monthCount) > 0) {
                monthString = '0' + (workingMonth - monthCount);
              } else if ((month - monthCount) === 0) {
                workingMonth = 12;
                year = year - 1;
                monthString = workingMonth + '';
              } else if ((month - monthCount) < 0) {
                if ((workingMonth + (month - monthCount)) < 10) {
                  monthString = '0' + (workingMonth + (month - monthCount));
                } else {
                  monthString = workingMonth + (month - monthCount) + '';
                }

              }

            } else {
              // monthString = (workingMonth - monthCount) + '';
            }
            items.push({
              id: year + '' + monthString,
              dimensionItem: year + '' + monthString,
              displayName: year + '' + monthString,
              dimensionItemType: 'PERIOD'
            })
          }
          return items;
        }
      }, LAST_4_QUARTERS: {
        getIso: () => {
          let year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const backQuarters = 4;
          let thisQuater = this._getQuarter() - 1;
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          const items = [];
          for (let counter = 1; counter <= backQuarters; counter++) {
            thisQuater--;
            if (thisQuater < 0) {
              year--;
              thisQuater = 3
            }

            items.push(
              {
                id: year + '' + quarters[thisQuater],
                dimensionItem: year + '' + quarters[thisQuater],
                displayName: year + '' + quarters[thisQuater],
                dimensionItemType: 'PERIOD'
              }
            )
          }

          return items
        }
      }, THIS_QUARTER: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const thisQuater = this._getQuarter() - 1;
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          const items = [];
          items.push(
            {
              id: year + '' + quarters[thisQuater],
              dimensionItem: year + '' + quarters[thisQuater],
              displayName: year + '' + quarters[thisQuater],
              dimensionItemType: 'PERIOD'
            }
          )

          return items
        }
      }, LAST_QUARTER: {
        getIso: () => {
          let year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const backQuarters = 1;
          let thisQuater = this._getQuarter() - 1;
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          const items = [];
          for (let counter = 1; counter <= backQuarters; counter++) {
            thisQuater--;
            if (thisQuater < 0) {
              year--;
              thisQuater = 3
            }

            items.push(
              {
                id: year + '' + quarters[thisQuater],
                dimensionItem: year + '' + quarters[thisQuater],
                displayName: year + '' + quarters[thisQuater],
                dimensionItemType: 'PERIOD'
              }
            )
          }

          return items
        }
      }
      , LAST_5_YEARS: {
        getIso: () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          let workingYear = 0
          const backYears = 5;
          const items = [];
          for (let counter = backYears; counter >= 1; counter--) {
            workingYear = year - counter;
            items.push(
              {
                id: workingYear,
                dimensionItem: workingYear,
                displayName: workingYear,
                dimensionItemType: 'PERIOD'
              }
            )
          }

          return items
        }
      }
    }

    dimensionsObject.items.forEach(periodDimensionItem => {
      if (this._isRelativePeriod(periodDimensionItem.id)) {
        if (periodObject[periodDimensionItem.id]) {
          const items = periodObject[periodDimensionItem.id].getIso();
          dimentionTemplate.items = [...items];
        }
      } else {
        dimentionTemplate.items.push(periodDimensionItem);
      }

    })

    return dimentionTemplate;
  }

  private _periodDimensionExist(dimensionArray) {
    let periodExist = false;
    const periodIndex = _.findIndex(dimensionArray, ['dimension', 'pe']);
    if (periodIndex >= 0) {
      periodExist = true;
    }
    return periodExist;
  }

  private _isRelativePeriod(period) {
    let availability = false;
    if (period.indexOf('_') >= 0) {
      availability = true;
    }
    return availability;
  }

  private _getQuarter(d?) {
    d = d || new Date(); // If no date supplied, use today
    const q = [1, 2, 3, 4];
    return q[Math.floor(d.getMonth() / 3)];
  }
}
