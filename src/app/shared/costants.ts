/**
 * Created by kelvin on 9/19/16.
 */
export class Constants {
    root_dir: string;

    current_orgunit: any = null;
    current_period: any = null;
    current_period_name  : any = null;

    constructor(){
        this.root_dir = 'http://127.0.0.1:9000/';
      // this.root_dir = 'http://41.217.202.50:9002/dhis/'
      // this.root_dir = 'https://dhis.moh.go.tz/'
      // this.root_dir = 'https://play.dhis2.org/demo/';
    }

    getPeriods (period_type: string, year: number, years: number) : Array<any> {
      let periods = [];
      if (period_type === 'Quarterly') {
        let min = year - years;
        for (let i = year; i>= min; i--) {
          periods.push(
            {id:i+'Q4',name:'Oct - Dec '+ i},
            {id:i+'Q3',name:'Jul - Sep '+ i},
            {id:i+'Q2',name:'Apr - Jun '+ i},
            {id:i+'Q1',name:'Jan - Mar '+ i}
            )
        }
      }

      return periods;
    }

}
