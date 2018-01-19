import {CreatedScorecardState} from '../reducers/create.reducer';
import {ScoreCard, ScorecardData} from '../../shared/models/scorecard';
import {ViewScorecardState} from "../reducers/view.reducer";

export function createScorecardFromStore(scorecard: CreatedScorecardState | ViewScorecardState): ScoreCard {
  if (scorecard) {
    const scorecardState = {...scorecard}
    return {
      id: scorecardState.id,
      name: scorecardState.header.title,
      description: scorecardState.header.description,
      can_edit: scorecardState.can_edit,
      data: {
        'orgunit_settings': scorecardState.orgunit_settings,
        'average_selection': scorecardState.average_selection,
        'shown_records': scorecardState.shown_records,
        'show_average_in_row': scorecardState.show_average_in_row,
        'show_average_in_column': scorecardState.show_average_in_column,
        'periodType': scorecardState.periodType,
        'selected_periods': scorecardState.selected_periods,
        'show_data_in_column': scorecardState.show_data_in_column,
        'show_score': scorecardState.show_score,
        'show_rank': scorecardState.show_rank,
        'empty_rows': scorecardState.empty_rows,
        'show_hierarchy': scorecardState.show_hierarchy,
        'rank_position_last': scorecardState.rank_position_last,
        'header': scorecardState.header,
        'legendset_definitions': scorecardState.legendset_definitions,
        'highlighted_indicators': scorecardState.highlighted_indicators,
        'data_settings': {
          'indicator_holders': scorecardState.indicator_holders,
          'indicator_holder_groups': scorecardState.indicator_holder_groups
        },
        'additional_labels': scorecardState.additional_labels,
        'footer': scorecardState.footer,
        'indicator_dataElement_reporting_rate_selection': scorecardState.indicator_dataElement_reporting_rate_selection,
        'user': scorecardState.user,
        'user_groups': scorecardState.user_groups
      }
    };
  }

}

export function getScorecardOptions(data: ScorecardData) {
  return {
    show_legend_definition: data.header.show_legend_definition,
    show_rank: data.show_rank,
    empty_rows: data.empty_rows,
    show_hierarchy: data.show_hierarchy,
    show_average_in_column: data.show_average_in_column,
    show_average_in_row: data.show_average_in_row,
    average_selection: data.average_selection,
    shown_records: data.shown_records,
    show_score: data.show_score,
    show_arrows_definition: data.header.show_arrows_definition,
    show_data_in_column: data.show_data_in_column,
    show_title: data.header.template.display
  };
}
