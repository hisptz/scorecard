import {ScoreCard} from '../../shared/models/scorecard';
import * as createActions from '../actions/create.actions';
import * as _ from 'lodash';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import {User} from '../../shared/models/user';
import {UserGroup} from '../../shared/models/user-group';
import {OrgUnitModel} from '../../shared/models/org-unit-model';
import {Legend} from '../../shared/models/legend';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';
import * as viewActions from '../actions/view.actions';


export interface CreatedScorecardState {
  action_type?: string;
  id: string;
  need_for_group: boolean;
  can_edit: boolean;
  current_indicator_holder: IndicatorHolder;
  current_group: IndicatorHolderGroup;
  next_group_id: number;
  next_holder_id: number;
  need_for_indicator: boolean;
  show_title_editor: boolean;
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
}

export const InitialCreateState: CreatedScorecardState = {
  action_type: 'create',
  id: '',
  need_for_group: true,
  can_edit: true,
  current_indicator_holder: {
    'holder_id': 1,
    'indicators': []
  },
  current_group: {
    'id': 1,
    'name': 'Default',
    'indicator_holder_ids': [],
    'background_color': '#ffffff',
    'holder_style': null
  },
  next_group_id: null,
  next_holder_id: null,
  need_for_indicator: false,
  show_title_editor: false,
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
      display: true,
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
  user_groups: []
};

export function createReducer(
  state = InitialCreateState,
  action: createActions.Actions
): CreatedScorecardState {

  switch (action.type) {
    case (createActions.SET_CREATED_SCORECARD): {
      const scorecard = action.payload;
      return {...state, ...scorecard  };
    }

    case (createActions.SET_CURRENT_GROUP): {
      return {...state, current_group: action.payload };
    }

    case (createActions.SET_CURRENT_INDICATOR_HOLDER): {
      return {...state, current_indicator_holder: {...action.payload} };
    }

    case (createActions.SET_NEXT_GROUP_ID): {
      return {...state, next_group_id: action.payload };
    }

    case (createActions.SET_NEXT_HOLDER_ID): {
      return {...state, next_holder_id: action.payload };
    }

    case (createActions.SET_NEED_FOR_INDICATOR): {
      return {...state, need_for_indicator: action.payload };
    }

    case (createActions.SET_NEED_FOR_GROUP): {
      return {...state, need_for_group: action.payload };
    }

    case (createActions.SET_EDDITING_HEADER): {
      return {...state, show_title_editor: action.payload };
    }

    case (createActions.SET_ORGUNIT_SETTINGS): {
      return {
        ...state,
        orgunit_settings: {...state.orgunit_settings, ...action.payload}
      };
    }

    case (createActions.SET_ITEM): {
      return {...state, [action.payload.key]: action.payload.value };
    }

    case (createActions.SET_LEGEND): {
      const legendset_definitions = action.payload;
      return {...state, legendset_definitions };
    }

    case (createActions.SET_HEADER): {
      const header = action.payload;
      return {...state, header };
    }

    case (createActions.SET_HOLDERS): {
      const  indicator_holders = action.payload;
      return {...state, indicator_holders };
    }

    case (createActions.SET_USER_GROUP): {
      const  user_groups = action.payload;
      return {...state, user_groups };
    }

    case (createActions.SET_HOLDER_GROUPS): {
      const  indicator_holder_groups = action.payload;
      return {...state, indicator_holder_groups };
    }

    case (createActions.SET_ADDITIONAL_LABELS): {
      const  additional_labels = action.payload;
      return {...state, additional_labels };
    }

    case (createActions.SET_PERIOD_TYPE): {
      return {...state, periodType: action.payload };
    }

    case (createActions.SET_SELECTED_PERIODS): {
      return {...state, selected_periods: action.payload };
    }

    case (createActions.SET_OPTIONS): {
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


export const getNeedForGroup = (state: CreatedScorecardState) => state.need_for_group;
export const getNeedForIndicator = (state: CreatedScorecardState) => state.need_for_indicator;
export const getCurrentIndicatorHolder = (state: CreatedScorecardState) => state.current_indicator_holder;
export const getCurrentGroup = (state: CreatedScorecardState) => state.current_group;
export const getNextGroupId = (state: CreatedScorecardState) => state.next_group_id;
export const getNextHolderId = (state: CreatedScorecardState) => state.next_holder_id;
export const getShowTitleEditor = (state: CreatedScorecardState) => state.show_title_editor;
export const getActionType = (state: CreatedScorecardState) => state.action_type;
