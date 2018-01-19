import {User} from '../../shared/models/user';
import {UserGroup} from '../../shared/models/user-group';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';
import {OrgUnitModel} from '../../shared/models/org-unit-model';
import {Legend} from '../../shared/models/legend';
import * as viewActions from '../actions/view.actions';

export interface ViewScorecardState {
  active_scorecards: any;
  id: string;
  can_edit: boolean;
  orgunit_settings: OrgUnitModel;
  average_selection: string;
  shown_records: string;
  show_average_in_row: boolean;
  show_average_in_column: boolean;
  periodType: string;
  selected_periods: any[];
  show_data_in_column: boolean;
  show_score: boolean;
  show_rank: boolean;
  empty_rows?: boolean;
  show_hierarchy?: boolean;
  rank_position_last: boolean;
  header: {
    title: string,
    sub_title: string,
    description: string,
    show_arrows_definition: boolean,
    show_legend_definition: boolean,
    template: {
      display: boolean,
      content: string
    }
  };
  legendset_definitions: Legend[];
  highlighted_indicators: {
    display: false,
    definitions: any[]
  };
  indicator_holders: IndicatorHolder[];
  indicator_holder_groups: IndicatorHolderGroup[];
  additional_labels: any[];
  footer: {
    display_generated_date: string,
    display_title: boolean,
    sub_title: string,
    description: string,
    template: string
  };
  indicator_dataElement_reporting_rate_selection: string;
  user: User;
  user_groups: UserGroup[];
  loaded?: boolean;
  loading?: boolean;
  loading_percent?: number;
  orgunit?: any;
  period?: any;
  showModel?: boolean;
  sortingColumn?: string;
}

export const initialViewState: ViewScorecardState = {
  active_scorecards: null,
  id: '',
  can_edit: true,
  orgunit_settings: {
    selection_mode: 'Usr_orgUnit',
    selected_levels: [],
    show_update_button: true,
    selected_groups: [],
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    type: 'report',
    selected_user_orgunit: []
  },
  average_selection: 'all',
  shown_records: 'all',
  show_average_in_row: false,
  show_average_in_column: false,
  periodType: 'Quarterly',
  selected_periods: [{
    id: '2017Q1',
    name: 'January - March 2017'
  }],
  show_data_in_column: false,
  show_score: false,
  show_rank: false,
  empty_rows: false,
  show_hierarchy: false,
  rank_position_last: true,
  header: {
    title: '',
    sub_title: '',
    description: '',
    show_arrows_definition: true,
    show_legend_definition: true,
    template: {
      display: false,
      content: ''
    }
  },
  legendset_definitions: [
    {
      color: '#008000',
      definition: 'Target achieved / on track'
    },
    {
      color: '#FFFF00',
      definition: 'Progress, but more effort required'
    },
    {
      color: '#FF0000',
      definition: 'Not on track'
    },
    {
      color: '#D3D3D3',
      definition: 'N/A',
      default: true
    },
    {
      color: '#FFFFFF',
      definition: 'No data',
      default: true
    }
  ],
  highlighted_indicators: {
    display: false,
    definitions: []
  },
  indicator_holders: [],
  indicator_holder_groups: [],
  additional_labels: [],
  footer: {
    display_generated_date: '',
    display_title: false,
    sub_title: '',
    description: '',
    template: ''
  },
  indicator_dataElement_reporting_rate_selection: 'Indicators',
  user: null,
  user_groups: [],
  loaded: false,
  loading: true,
  loading_percent: 0,
  orgunit: null,
  period: null,
  showModel: false,
  sortingColumn: 'none'
};

export function viewReducer(
  state: ViewScorecardState = initialViewState,
  action: viewActions.Actions
): ViewScorecardState {

  switch (action.type) {
    case (viewActions.SET_VIEWED_SCORECARD): {
      const scorecard = action.payload;
      const loaded = true;
      return {...state, ...scorecard, loaded};
    }

    case (viewActions.SET_SELECTED_PE): {
      const period = action.payload;
      return {...state, period};
    }

    case (viewActions.SET_SELECTED_OU): {
      const orgunit = action.payload;
      console.log({...state, orgunit})
      return {...state, orgunit};
    }

    case (viewActions.SET_SORTING_COLUMN): {
      return {...state, sortingColumn: action.payload};
    }

    case (viewActions.SET_SCORECARD_OPTIONS): {
      const options = {
        show_rank: action.payload.show_rank,
        empty_rows: action.payload.empty_rows,
        show_hierarchy: action.payload.show_hierarchy,
        show_average_in_column: action.payload.show_average_in_column,
        show_average_in_row: action.payload.show_average_in_row,
        average_selection: action.payload.average_selection,
        shown_records: action.payload.shown_records,
        show_score: action.payload.show_score,
        show_data_in_column: action.payload.show_data_in_column
      };
      const header = {
        ...state.header,
        show_legend_definition: action.payload.show_legend_definition,
        show_arrows_definition: action.payload.show_arrows_definition,
        template: {
          ...state.header.template,
          display: action.payload.show_title
        }
      };
      return {...state, header, ...options};
    }
  }

  return state;
}
