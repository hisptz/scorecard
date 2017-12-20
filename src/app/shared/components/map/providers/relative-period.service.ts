import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {iterator} from 'rxjs/symbol/iterator';

@Injectable()
export class RelativePeriodService {

  constructor() {

  }


  getISOFormatFromRelativePeriod(favourite): Array<string> {
    let isoFormat = [];
    let periodDimension:any = undefined;
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
      newPeriodDimension.items = this._generateCorrespondingFixedPeriodArray(periodDimension.items);
      favourite[parentdimension].splice(periodIndex, 1);
      favourite[parentdimension].push(newPeriodDimension);
    }
    favourite.hideTitle = false;
    return favourite;
  }

  private _periodDimensionExist(dimensionArray) {
    let periodExist = false;
    const periodIndex = _.findIndex(dimensionArray, ['dimension', 'pe']);
    if (periodIndex >= 0) {
      periodExist = true;
    }
    return periodExist;
  }

  private _generateCorrespondingFixedPeriodArray(relativePeriodArray) {
    let fixedPeriods = [];
    if (relativePeriodArray) {
      relativePeriodArray.forEach((relativePeriod) => {
        const newPeriods = this._getFixedPeriodArrayFromSingleRelativePeriod(relativePeriod);
        fixedPeriods = [...fixedPeriods, ...newPeriods];
      })
    }
    if (fixedPeriods.length <= 0) {
      fixedPeriods = relativePeriodArray;
    }
    return fixedPeriods;
  }

  /**
   This function return array of fixed periods from one relative period
   */
  private _getFixedPeriodArrayFromSingleRelativePeriod(relativePeriod): Array<Object> {
    const periodCategory = ['_MONTH', '_BIMONTH', '_QUARTER', '_SIXMONTHS', '_SIX_MONTH', '_YEAR', '_WEEK', '_FINANCIAL_YEAR'];
    const periodTenses = ['THIS', 'LAST'];
    let fixedPeriods = [];
    const template = {
      id: '',
      dimensionItem: '',
      displayName: '',
      dimensionItemType: 'PERIOD'
    }
    const periodFunctions = this._getExecutingPeriodFunctions();
    if (relativePeriod) {
      let functionName = null;
      periodCategory.forEach((category) => {
        if (relativePeriod.id.indexOf(category) > -1) {
          functionName = category;
        }
      });

      /**
       Execute dynamic functions that return fixed periods
       */
      if (functionName) {
        fixedPeriods = periodFunctions[functionName](
          template,
          this._getPeriodCounts(periodTenses, relativePeriod),
          this._getPeriodTense(periodTenses, relativePeriod));
      }

    }
    return fixedPeriods;
  }

  /**
   Function that return other functions that return fixed periods specific to period type
   */
  private _getExecutingPeriodFunctions() {
    const currentDate = new Date();
    return {
      '_MONTH': (template, counts, tense) => {
        const currentMonth = currentDate.getMonth();
        const lastNMonths = this._getLastPeriods(currentMonth, counts, 12, tense);
        let currentYear = currentDate.getFullYear();
        const months = [];
        let endOfTheYear = false;

        lastNMonths.forEach((month) => {
          const theTemplate = template;
          month === 12 ? endOfTheYear = true : endOfTheYear = false;
          if (month < 10) {
            months.push({
              id: currentYear + '0' + month,
              dimensionItem: currentYear + '0' + month,
              displayName: currentYear + '0' + month,
              dimensionItemType: 'PERIOD'
            });
          } else {
            if (endOfTheYear) {
              currentYear = currentYear - 1;
              endOfTheYear = false
            }
            months.push({
              id: currentYear + '' + month,
              dimensionItem: currentYear + '' + month,
              displayName: currentYear + '' + month,
              dimensionItemType: 'PERIOD'
            });
          }
        });

        return _.reverse(months);
      },
      '_QUARTER': (template, counts, tense) => {
        const currentQuarter = this._getThisQuarter();
        const lastNQuarters = this._getPeriods(currentQuarter, tense, counts, 4);
        let currentYear = currentDate.getFullYear();
        const quarters = [];
        let endOfTheYear = false;
        lastNQuarters.forEach((nthQuarter) => {

          nthQuarter === 4 ? endOfTheYear = true : endOfTheYear = false;
          if (endOfTheYear && tense === 'LAST') {
            currentYear = currentYear - 1;
            endOfTheYear = false
          }
          quarters.push({
            id: currentYear + 'Q' + nthQuarter,
            dimensionItem: currentYear + 'Q' + nthQuarter,
            displayName: currentYear + 'Q' + nthQuarter,
            dimensionItemType: 'PERIOD'
          });

        });
        return _.reverse(quarters);
      },
      '_YEAR': (template, counts, tense) => {
        const currentYear = currentDate.getFullYear();
        const lastNYears = this._getPeriods(currentYear, tense, counts, 12);

        return _.reverse(lastNYears.map((nthYear) => {
          return {
            id: nthYear + '',
            dimensionItem: nthYear + '',
            displayName: nthYear + '',
            dimensionItemType: 'PERIOD'
          };
        }));
      },
      '_BIMONTH': (template, counts, tense) => {
        const currentBimonth = this._getThisBimonth();
        const lastNBimonths = this._getPeriods(currentBimonth, tense, counts, 6);
        let currentYear = currentDate.getFullYear();
        const bimonths = [];
        let endOfTheYear = false;
        lastNBimonths.forEach((nthBimonth) => {
          nthBimonth === 6 ? endOfTheYear = true : endOfTheYear = false;
          if (endOfTheYear) {
            currentYear = currentYear - 1;
            endOfTheYear = false;
          }
          bimonths.push({
            id: currentYear + '0' + nthBimonth + 'B',
            dimensionItem: currentYear + '0' + nthBimonth + 'B',
            displayName: currentYear + '0' + nthBimonth + 'B',
            dimensionItemType: 'PERIOD'
          });

        });

        return _.reverse(bimonths);
      },
      '_SIXMONTHS': (template, counts, tense) => {
        const currentSixmonth = this._getThisSixmonth();
        const lastSixmonths = this._getLastPeriods(currentSixmonth, counts, 2, tense);
        let currentYear = currentDate.getFullYear();
        const sixmonths = [];
        let endOfTheYear = false;
        lastSixmonths.forEach((nthSixmonth) => {
          nthSixmonth === 2 ? endOfTheYear = true : endOfTheYear = false;
          if (endOfTheYear) {
            currentYear = currentYear - 1;
            endOfTheYear = false;
          }
          sixmonths.push({
            id: currentYear + 'S' + nthSixmonth,
            dimensionItem: currentYear + 'S' + nthSixmonth,
            displayName: currentYear + 'S' + nthSixmonth,
            dimensionItemType: 'PERIOD'
          });
        });
        return sixmonths;
      },
      '_SIX_MONTH': (template, counts, tense) => {
        const currentSixmonth = this._getThisSixmonth();
        const lastSixmonths = this._getLastPeriods(currentSixmonth, counts, 2, tense);
        let currentYear = currentDate.getFullYear();
        const sixmonths = [];
        let endOfTheYear = false;
        lastSixmonths.forEach((nthSixmonth) => {
          nthSixmonth === 2 ? endOfTheYear = true : endOfTheYear = false;
          if (endOfTheYear) {
            currentYear = currentYear - 1;
            endOfTheYear = false;
          }
          sixmonths.push({
            id: currentYear + 'S' + nthSixmonth,
            dimensionItem: currentYear + 'S' + nthSixmonth,
            displayName: currentYear + 'S' + nthSixmonth,
            dimensionItemType: 'PERIOD'
          });
        });
        return sixmonths;
      },
      '_WEEK': (template, counts, tense) => {
        const currentWeek = this._getThisWeek();
        const lastNWeeks = this._getPeriods(currentWeek, tense, counts, 52);
        let currentYear = currentDate.getFullYear();
        const lastWeeks = [];
        let endOfTheYear = false;
        lastNWeeks.forEach((nthLastWeek) => {
          nthLastWeek === 52 ? endOfTheYear = true : endOfTheYear = false;
          if (endOfTheYear) {
            currentYear = currentYear - 1;
            endOfTheYear = false;
          }
          lastWeeks.push({
            id: currentYear + 'W' + nthLastWeek,
            dimensionItem: currentYear + 'W' + nthLastWeek,
            displayName: currentYear + 'W' + nthLastWeek,
            dimensionItemType: 'PERIOD'
          });

        });
        return _.reverse(lastWeeks);
      },
      '_FINANCIAL_YEAR': (template, counts, tense) => {
        const hypotheticalFinancialYearMonth = 10;
        const currentFinancialYear = this._getThisFinancialYear();
        let currentYear = currentDate.getFullYear();
        let nthFinancialYears = [];
        if (tense == 'LAST') {
          for (let counter = 0; counter < counts; counter++) {
            currentYear = currentYear - 1;
            nthFinancialYears.push({
              id: currentYear + 'Oct',
              dimensionItem: currentYear + 'Oct',
              displayName: currentYear + 'Oct',
              dimensionItemType: 'PERIOD'
            });
          }

        }
        if (nthFinancialYears.length < 1) {
          nthFinancialYears.push({
            id: currentYear + 'Oct',
            dimensionItem: currentYear + 'Oct',
            displayName: currentYear + 'Oct',
            dimensionItemType: 'PERIOD'
          });
        }
        return _.reverse(nthFinancialYears);
      }
    }
  }

  /**
   This function return particular tense of the period
   */
  private _getPeriodTense(periodTenses, relativePeriod) {
    let selectedTense = null;
    periodTenses.forEach(function (tense) {
      if (relativePeriod.id.indexOf(tense) > -1) {
        selectedTense = tense;
      }
    });
    return selectedTense;
  }

  /**
   This function return particular tense of the period
   */
  private _getPeriodCounts(periodTenses, relativePeriod) {
    let selectedCount = 0;
    periodTenses.forEach(function (tense) {
      if (relativePeriod.id.indexOf(tense) > -1) {
        const tenseArray = relativePeriod.id.split('_');
        if (tenseArray.length > 2) {
          selectedCount = isNaN(tenseArray[1]) ? 1 : tenseArray[1];
        } else {
          selectedCount = 1;
        }
        return;
      }
    });
    return selectedCount;
  }

  private _getPeriods(current, tense, counts, endingValue) {
    const periods = [];
    if (tense === 'LAST') {
      let iterator =   current - 1;
      periods.push(iterator);
      for (let counter = 1; counter <= counts - 1; counter++) {
        if (iterator === 1) {
          iterator = endingValue;
          periods.push(iterator);
        } else {
          iterator--;
          periods.push(iterator);
        }

      }
    } else {
      periods.push(current)
    }

    return periods;
  }

  private _getLastQuarters(current, tense, counts) {
    const lastQuarters = [];
    if (tense === 'LAST') {
      let iterator =   current - 1;
      lastQuarters.push(iterator);
      for (let counter = 1; counter <= counts - 1; counter++) {
        if (iterator === 1) {
          iterator = 4;
          lastQuarters.push(iterator);
        } else {
          iterator--;
          lastQuarters.push(iterator);
        }

      }
    } else {
      lastQuarters.push(current)
    }

    return lastQuarters;
  }

  _getLastWeeks(current, tense, counts) {
    const lastWeeks = [];
    if (tense === 'LAST') {
      let iterator =   current - 1;
      lastWeeks.push(iterator);
      for (let counter = 1; counter <= counts - 1; counter++) {
        if (iterator === 1) {
          iterator = 52;
          lastWeeks.push(iterator);
        } else {
          iterator--;
          lastWeeks.push(iterator);
        }

      }
    } else {
      lastWeeks.push(current)
    }

    return lastWeeks;
  }

  _getLastYears(current, tense, counts) {
    const lastYears = [];
    if (tense === 'LAST') {
      let iterator =   current - 1;
      lastYears.push(iterator);
      for (let counter = 1; counter <= counts - 1; counter++) {
        if (iterator === 1) {
          iterator = 12;
          lastYears.push(iterator);
        } else {
          iterator--;
          lastYears.push(iterator);
        }

      }
    } else {
      lastYears.push(current)
    }

    return lastYears;
  }

  private _getLastPeriods(current, counts, typeLimit, tense) {
    const lastPeriods = [current];
    let iterator = current;
    if (tense === 'LAST') {
      for (let counter = 1; counter <= counts - 1; counter++) {
        if (iterator === 1) {
          iterator = 12;
          lastPeriods.push(iterator);
        } else {
          iterator--;
          lastPeriods.push(iterator);
        }

      }
    }

    return lastPeriods;
  }

  private  _getThisQuarter(d?) {
    d = d || new Date(); // If no date supplied, use today
    const q = [1, 2, 3, 4];
    return q[Math.floor(d.getMonth() / 3)];
  }

  private  _getThisBimonth(d?) {
    d = d || new Date();
    const q = [1, 2, 3, 4, 5, 6];
    return q[Math.floor(d.getMonth() / 2)];
  }

  private  _getThisSixmonth(d?) {
    d = d || new Date();
    const q = [1, 2];
    return q[Math.floor(d.getMonth() / 6)];
  }

  private _getThisWeek(d?) {
    d = d || new Date();
    d.setHours(0, 0, 0, 0);

    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);

    const week = new Date(d.getFullYear(), 0, 4);
    let thisWeek = 1 + Math.round(((d.getTime() - week.getTime()) / 86400000
        - 3 + (week.getDay() + 6) % 7) / 7);

    return thisWeek;
  }

  private _getThisFinancialYear(d?) {
    d = d || new Date();
    return d.getMonth()
  }

}
