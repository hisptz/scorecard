import {ScoreCard} from '../../shared/models/scorecard';
import * as selectedScorecardActions from '../actions/create.actions';
import * as _ from 'lodash';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import {User} from '../../shared/models/user';
import {UserGroup} from '../../shared/models/user-group';
import {OrgUnitModel} from '../../shared/models/org-unit-model';
import {Legend} from '../../shared/models/legend';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';


export interface SelectedScorecardState {
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
  title: string;
  sub_title: string;
  description: string;
  show_arrows_definition: boolean;
  show_legend_definition: boolean;
  display_template: boolean;
  header_template_content: string;
  legendset_definitions: Legend[];
  display_highlighted_indicators: boolean;
  additional_labels: any[];
  footer_display_generated_date: string;
  footer_display_title: boolean;
  footer_sub_title: string;
  footer_description: string;
  footer_template: string;
  indicator_dataElement_reporting_rate_selection: string;
  user: User;
  user_groups: UserGroup[];
}

export const InitialSelectedScorecardState: SelectedScorecardState = {
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
    id: 'LAST_QUARTER',
    name: 'Last Quarter'
  }],
  show_data_in_column: false,
  show_score: false,
  show_rank: false,
  empty_rows: false,
  show_hierarchy: false,
  rank_position_last: true,
  title: '',
  sub_title: '',
  description: '',
  show_arrows_definition: true,
  show_legend_definition: true,
  display_template: true,
  header_template_content: '',
  display_highlighted_indicators: false,
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
  additional_labels: [],
  footer_display_generated_date: '',
  footer_display_title: false,
  footer_sub_title: '',
  footer_description: '',
  footer_template: '',
  indicator_dataElement_reporting_rate_selection: 'Indicators',
  user: null,
  user_groups: []
};

export function createReducer(
  state = InitialSelectedScorecardState,
  action: selectedScorecardActions.Actions
): SelectedScorecardState {

  switch (action.type) {
    case (selectedScorecardActions.SET_CREATED_SCORECARD): {
      const scorecard = action.payload;
      return {...state, ...scorecard  };
    }
    //
    // case (selectedScorecardActions.SET_CURRENT_GROUP): {
    //   return {...state, current_group: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_CURRENT_INDICATOR_HOLDER): {
    //   return {...state, current_indicator_holder: {...action.payload} };
    // }
    //
    // case (selectedScorecardActions.SET_NEXT_GROUP_ID): {
    //   return {...state, next_group_id: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_NEXT_HOLDER_ID): {
    //   return {...state, next_holder_id: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_NEED_FOR_INDICATOR): {
    //   return {...state, need_for_indicator: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_NEED_FOR_GROUP): {
    //   return {...state, need_for_group: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_EDDITING_HEADER): {
    //   return {...state, show_title_editor: action.payload };
    // }
    //
    // case (selectedScorecardActions.SET_ITEM): {
    //   return {...state, [action.payload.key]: action.payload.value };
    // }
    //
    // case (selectedScorecardActions.SET_LEGEND): {
    //   const legendset_definitions = action.payload;
    //   return {...state, legendset_definitions };
    // }
    //
    // case (selectedScorecardActions.SET_HEADER): {
    //   const header = action.payload;
    //   return {...state, header };
    // }
    //
    // case (selectedScorecardActions.SET_HOLDERS): {
    //   const  indicator_holders = action.payload;
    //   return {...state, indicator_holders };
    // }
    //
    // case (selectedScorecardActions.SET_USER_GROUP): {
    //   const  user_groups = action.payload;
    //   return {...state, user_groups };
    // }
    //
    // case (selectedScorecardActions.SET_HOLDER_GROUPS): {
    //   const  indicator_holder_groups = action.payload;
    //   return {...state, indicator_holder_groups };
    // }
    //
    // case (selectedScorecardActions.SET_ADDITIONAL_LABELS): {
    //   const  additional_labels = action.payload;
    //   return {...state, additional_labels };
    // }
    //
    // case (selectedScorecardActions.SET_OPTIONS): {
    //   return state;
    // }
  }
  return state;
}


