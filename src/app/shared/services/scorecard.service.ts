import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ScoreCard } from '../models/scorecard';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { HttpClientService } from './http-client.service';
import { DataService } from './data.service';
import { ApplicationState, getRouterState } from '../../store/reducers';
import * as scorecardActions from '../../store/actions/scorecard.actions';
import * as createActions from '../../store/actions/create.actions';
import * as viewActions from '../../store/actions/view.actions';
import { SetHomeLoadingPercent } from '../../store/actions/ui.actions';
import { getScorecardEntites } from '../../store/selectors/scorecard.selectors';
import { take, tap, filter, first } from 'rxjs/operators';
import { getUser } from '../../store/selectors/static-data.selectors';
import { CreatedScorecardState } from '../../store/reducers/create.reducer';
import { IndicatorObject } from '../models/indicator-object';
import { IndicatorHolder } from '../models/indicator-holder';
import { ViewScorecardState } from '../../store/reducers/view.reducer';
import { IndicatorHolderGroup } from '../models/indicator-holders-group';
import { NgxDhis2HttpClientService, SystemInfo } from '@iapps/ngx-dhis2-http-client';
import { Fn} from '@iapps/function-analytics';

@Injectable()
export class ScorecardService {
_scorecards: ScoreCard[] = [];

	constructor(
		private http: HttpClientService,
		private httpClient: NgxDhis2HttpClientService,
		private dataService: DataService,
		private store: Store<ApplicationState>
	) {}

	loadAll(): Observable<any> {
		return this.http.get('dataStore/scorecards');
	}

	load(id: string): Observable<any> {
		return this.http.get(`dataStore/scorecards/${id}`);
	}

	getAllScoreCards() {
		if (this._scorecards.length !== 0) {
			this.store.dispatch(new scorecardActions.LoadScorecardsComplete());
			this._scorecards.forEach((scorecard) => {
				// this.store.dispatch(new AddScorecardAction( scorecard ));
			});
		} else {
			this.store.select(getUser).subscribe((userInfo) => {
				if (userInfo) {
					this.loadAll().subscribe(
						(scorecards) => {
							let scorecard_count = 0;
							scorecards.forEach((scorecard) => {
								// loading scorecard details
								this.load(scorecard).subscribe(
									(scorecard_details) => {
										const can_see = this.checkForUserGroupInScorecard(scorecard_details, userInfo)
											.see;
										const can_edit = this.checkForUserGroupInScorecard(scorecard_details, userInfo)
											.edit;
										this.addScorecardToStore(scorecard, scorecard_details, can_see, can_edit);
										this.dataService.sortArrOfObjectsByParam(this._scorecards, 'name', true);
										scorecard_count++;
										this.doneLoadingScorecard(scorecard_count, scorecards);
									},
									// catch error if anything happens when loading scorecard details
									(detail_error) => {
										this.doneLoadingScorecard(scorecard_count, scorecards);
									}
								);
							});
						},
						// catch error when there is no scorecard
						(error) => {
							this.store.dispatch(new scorecardActions.LoadScorecardsFail(error));
						}
					);
				}
			});
		}
	}

	// get the scorecard to be created
	getCreatedScorecard() {
		this.store.select(getRouterState).pipe(first()).subscribe((route) => {
			this.store.select(getUser).pipe(first()).subscribe((user) => {
				this.httpClient.systemInfo().subscribe((systemInfo: SystemInfo) => {
					if (route.state.url === '/create') {
						const scorecard = this.getEmptyScoreCard(systemInfo);
						this.store.dispatch(
							new createActions.SetCreatedScorecard(
								this.getScorecardForCreation(scorecard, 'create', {
									id: user.id
								})
							)
						);
					} else {
						const scorecardId = route.state.params.scorecardid;
						this.store.select(getScorecardEntites).pipe(first()).subscribe((scorecards) => {
							if (scorecards) {
								const scorecard_copy = { ...scorecards };
								this.store.dispatch(
									new createActions.SetCreatedScorecard(
										this.getScorecardForCreation({ ...scorecard_copy[scorecardId] }, 'edit', {
											id: user.id
										})
									)
								);
							}
						});
					}
				})
			});
		});
	}

	// get the scorecard to be viewed
	getViewedScorecard() {
		this.store.select(getRouterState).pipe(first()).subscribe((route) => {
			const scorecardId = route.state.params.scorecardid;
			this.store.select(getScorecardEntites).pipe(first()).subscribe((scorecards) => {
				if (scorecards) {
					const scorecard_copy = { ...scorecards };
					this.store.dispatch(
						new viewActions.SetViewdScorecard(
							this.getScorecardForViewing({
								...scorecard_copy[scorecardId]
							})
						)
					);
				}
			});
		});
	}

	doneLoadingScorecard(scorecard_count, scorecards) {
		this.store.dispatch(new SetHomeLoadingPercent(Math.floor(scorecard_count / scorecards.length * 100)));
		// set loading equal to false when all scorecards are loaded
		if (scorecard_count === scorecards.length) {
			this.store.dispatch(new scorecardActions.LoadScorecardsComplete());
		}
	}

	addScorecardToStore(scorecardId, scorecard_details, can_see = true, can_edit = true) {
		const scorecard_item: ScoreCard = {
			id: scorecardId,
			name: scorecard_details.header.title,
			description: scorecard_details.header.description,
			data: scorecard_details,
			can_edit: can_edit
		};
		if (can_see) {
			this.store.dispatch(new scorecardActions.LoadScorecardSuccess(scorecard_item));
			if (!_.find(this._scorecards, { id: scorecardId })) {
				this._scorecards.push(scorecard_item);
			}
		}
	}

	create(scorecard: ScoreCard) {
		return this.http.post('dataStore/scorecards/' + scorecard.id, scorecard.data);
	}

	update(scorecard: ScoreCard) {
		return this.http.put(`dataStore/scorecards/${scorecard.id}`, scorecard.data);
	}

	remove(scorecard: ScoreCard) {
		return this.http.delete(`dataStore/scorecards/${scorecard.id}`);
	}

	addRelatedIndicator(indicator_id, related_indicators) {
		this.getRelatedIndicators(indicator_id).subscribe(
			// if it is available update the item in data store
			(data) => {
				this.updateRelatedIndicator(indicator_id, related_indicators).subscribe(
					(returned_data) => {},
					(error) => console.error('something went wrong', error)
				);
			},
			// if it is not available add new item in datastore
			(error) => {
				this.createRelatedIndicator(indicator_id, related_indicators).subscribe(
					(data) => {},
					(errorr) => console.error('something went wrong', errorr)
				);
			}
		);
	}

	getRelatedIndicators(indicator_id) {
		return this.http.get(`dataStore/scorecardRelatedIndicators/${indicator_id}`);
	}

	createRelatedIndicator(indicator_id, related_indicators) {
		return this.http.post('dataStore/scorecardRelatedIndicators/' + indicator_id, related_indicators);
	}

	updateRelatedIndicator(indicator_id, related_indicators) {
		return this.http.put('dataStore/scorecardRelatedIndicators/' + indicator_id, related_indicators);
	}

	// generate a random list of Id for use as scorecard id
	makeid(): string {
		let text = '';
		const possible_combinations = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 11; i++) {
			text += possible_combinations.charAt(Math.floor(Math.random() * possible_combinations.length));
		}
		return text;
	}

	// Define default scorecard sample
	getEmptyScoreCard(systemInfo: SystemInfo): ScoreCard {
		const periodInstance = new Fn.Period();
		const periodList = periodInstance.setType('Quarterly').setCalendar(systemInfo.keyCalendar).get().list();
		let year = periodInstance.currentYear();
		if (periodList.length === 0 ) {
			year --;
			periodInstance.setYear(year).get().list();
		}
		const selectedPeriods = [(periodInstance.list() || [])[0]];

		return {
			id: this.makeid(),
			name: '',
			description: '',
			can_edit: true,
			data: {
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
				show_league_table: false,
				show_league_table_all: false,
				show_average_in_column: false,
				periodType: 'Quarterly',
				selected_periods: selectedPeriods,
				show_data_in_column: false,
				show_score: false,
				show_rank: false,
				empty_rows: true,
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
				data_settings: {
					indicator_holders: [],
					indicator_holder_groups: []
				},
				additional_labels: [],
				footer: {
					display_generated_date: false,
					display_title: false,
					sub_title: null,
					description: null,
					template: null
				},
				indicator_dataElement_reporting_rate_selection: 'Indicators',
				user: {},
				user_groups: []
			}
		};
	}

	// define a default indicator structure
	getIndicatorStructure(name: string, id: string, legendset: any = null, tittle: string = null): IndicatorObject {
		if (tittle == null) {
			tittle = name;
		}
		return {
			name: name,
			id: id,
			calculation: 'analytics',
			function_to_use: '',
			title: tittle,
			high_is_good: true,
			value: 0,
			weight: 100,
			legend_display: true,
			legendset: legendset,
			additional_label_values: {},
			use_bottleneck_groups: true,
			bottleneck_indicators_groups: [],
			bottleneck_indicators: [],
			arrow_settings: {
				effective_gap: 5,
				display: true
			},
			label_settings: {
				display: true,
				font_size: ''
			}
		};
	}

	checkForUserGroupInScorecard(scorecard, user): any {
		let checker_see = false;
		let checker_edit = false;
		if (scorecard.hasOwnProperty('user')) {
			if (user.id === scorecard.user.id) {
				checker_see = true;
				checker_edit = true;
			}
		} else {
			checker_see = true;
			checker_edit = true;
		}
		if (scorecard.hasOwnProperty('user_groups')) {
			for (const group of scorecard.user_groups) {
				if (group.id === 'all') {
					if (group.see) {
						checker_see = true;
					}
					if (group.edit) {
						checker_see = true;
						checker_edit = true;
					}
				}
				for (const user_group of user.userGroups) {
					if (user_group.id === group.id) {
						if (group.see) {
							checker_see = true;
						}
						if (group.edit) {
							checker_see = true;
							checker_edit = true;
						}
					}
				}
			}
		}
		return { see: checker_see, edit: checker_edit };
	}

	// prepare a scorecard for adding to creation state
	getScorecardForCreation(scorecard: ScoreCard, type: string, user): any {
		scorecard = this.sanitize_scorecard(scorecard);
		return {
			action_type: type,
			id: scorecard.id,
			need_for_group: scorecard.data.data_settings.indicator_holders.length !== 0,
			can_edit: scorecard.can_edit,
			current_indicator_holder: this.deduceStartingIndicatorHolder(scorecard).current_indicator_holder,
			current_group: this.deduceStartingIndicatorHolder(scorecard).current_group,
			next_group_id: null,
			next_holder_id: null,
			need_for_indicator: scorecard.data.data_settings.indicator_holders.length !== 0,
			show_title_editor: false,
			orgunit_settings: scorecard.data.orgunit_settings,
			average_selection: scorecard.data.average_selection,
			shown_records: scorecard.data.shown_records,
			show_average_in_row: scorecard.data.show_average_in_row,
			show_average_in_column: scorecard.data.show_average_in_column,
			show_league_table: scorecard.data.hasOwnProperty('show_league_table')
				? scorecard.data.show_league_table
				: false,
			show_league_table_all: scorecard.data.hasOwnProperty('show_league_table_all')
				? scorecard.data.show_league_table_all
				: false,
			periodType: scorecard.data.periodType,
			selected_periods: scorecard.data.selected_periods,
			show_data_in_column: scorecard.data.show_data_in_column,
			show_score: scorecard.data.show_score,
			show_rank: scorecard.data.show_rank,
			empty_rows: scorecard.data.hasOwnProperty('empty_rows') ? scorecard.data.empty_rows : false,
			show_hierarchy: scorecard.data.hasOwnProperty('show_hierarchy') ? scorecard.data.show_hierarchy : false,
			rank_position_last: scorecard.data.rank_position_last,
			header: scorecard.data.header,
			legendset_definitions: scorecard.data.legendset_definitions,
			highlighted_indicators: scorecard.data.highlighted_indicators,
			indicator_holders: scorecard.data.data_settings.indicator_holders,
			indicator_holder_groups: scorecard.data.data_settings.indicator_holder_groups,
			additional_labels: scorecard.data.additional_labels,
			footer: scorecard.data.footer,
			indicator_dataElement_reporting_rate_selection:
				scorecard.data.indicator_dataElement_reporting_rate_selection,
			user: scorecard.data.user.hasOwnProperty('id') ? scorecard.data.user : user,
			user_groups: scorecard.data.user_groups
		};
	}

	deduceStartingIndicatorHolder(
		scorecard: ScoreCard
	): {
		current_indicator_holder: IndicatorHolder;
		current_group: IndicatorHolderGroup;
	} {
		if (scorecard.data.data_settings.indicator_holders.length === 0) {
			return {
				current_indicator_holder: {
					holder_id: this.getStartingIndicatorId(scorecard.data.data_settings.indicator_holders),
					indicators: []
				},
				current_group: {
					id: this.getStartingGroupHolderId(scorecard.data.data_settings.indicator_holder_groups),
					name: 'Default',
					indicator_holder_ids: [],
					background_color: '#ffffff',
					holder_style: null
				}
			};
		} else {
			return {
				current_indicator_holder: _.find(scorecard.data.data_settings.indicator_holders, {
					holder_id: scorecard.data.data_settings.indicator_holder_groups[0].indicator_holder_ids[0]
				}),
				current_group: scorecard.data.data_settings.indicator_holder_groups[0]
      };
		}
	}

	// prepare a scorecard for for adding in viewing state
	getScorecardForViewing(scorecard: ScoreCard): ViewScorecardState {
		scorecard = this.sanitize_scorecard(scorecard);
		return {
			active_scorecards: {
				[scorecard.id]: scorecard
			},
			id: scorecard.id,
			can_edit: scorecard.can_edit,
			orgunit_settings: scorecard.data.orgunit_settings,
			average_selection: scorecard.data.average_selection,
			shown_records: scorecard.data.shown_records,
			show_average_in_row: scorecard.data.show_average_in_row,
			show_league_table: scorecard.data.show_league_table,
			show_league_table_all: scorecard.data.show_league_table_all,
			show_average_in_column: scorecard.data.show_average_in_column,
			periodType: scorecard.data.periodType,
			selected_periods: scorecard.data.selected_periods,
			show_data_in_column: scorecard.data.show_data_in_column,
			show_score: scorecard.data.show_score,
			show_rank: scorecard.data.show_rank,
			empty_rows: scorecard.data.empty_rows,
			show_hierarchy: scorecard.data.show_hierarchy,
			rank_position_last: scorecard.data.rank_position_last,
			header: scorecard.data.header,
			legendset_definitions: scorecard.data.legendset_definitions,
			highlighted_indicators: scorecard.data.highlighted_indicators,
			indicator_holders: this.sanitize_holders(scorecard.data.data_settings.indicator_holders),
			indicator_holder_groups: scorecard.data.data_settings.indicator_holder_groups,
			additional_labels: scorecard.data.additional_labels,
			footer: scorecard.data.footer,
			indicator_dataElement_reporting_rate_selection:
				scorecard.data.indicator_dataElement_reporting_rate_selection,
			user: scorecard.data.user,
			user_groups: scorecard.data.user_groups,
			loading: true,
			loading_percent: 0,
			orgunit: null,
			period: null,
			showModel: false,
			sortingColumn: 'none'
		};
	}

	sanitize_holders(holders: any) {
		return (holders || []).map((holder: any) => {
			return {
				...holder,
				indicators: (holder.indicators || []).map((indicator: any) => {
					return {
						...indicator,
						use_bottleneck_groups: indicator.hasOwnProperty('use_bottleneck_groups') ? indicator.use_bottleneck_groups : false,
						values: indicator.hasOwnProperty('values') ? indicator.values : [],
						showTopArrow: indicator.hasOwnProperty('showTopArrow') && indicator.showTopArrow instanceof Array ? indicator.showTopArrow : [],
showBottomArrow: indicator.hasOwnProperty('showBottomArrow') && indicator.showBottomArrow instanceof Array ? indicator.showBottomArrow : [],
						bottleneck_indicators_groups: indicator.hasOwnProperty('bottleneck_indicators_groups') ? indicator.bottleneck_indicators_groups : []
					};
				})
			};
		});
	}

	sanitize_scorecard(scorecard) {
		const data = _.clone(scorecard.data);
		if (!scorecard.data.hasOwnProperty('orgunit_settings')) {
			data.orgunit_settings = {
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
			};
		} else if (!scorecard.data.orgunit_settings.hasOwnProperty('selected_orgunits')) {
			data.orgunit_settings = {
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
			};
		} else if (!this.isArray(scorecard.data.orgunit_settings.selected_levels)) {
			data.orgunit_settings = {
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
			};
		}
		if (scorecard.data.selected_periods.length === 0) {
			data.selected_periods = [ { name: 'Last Quarter', id: 'LAST_QUARTER' } ];
		}
		// attach average_selection if none is defined
		if (!scorecard.data.hasOwnProperty('average_selection')) {
			data.average_selection = 'all';
		}
		// attach shown_records if none is defined
		if (!scorecard.data.hasOwnProperty('shown_records')) {
			data.shown_records = 'all';
		}
		// attach show_average_in_row if none is defined
		if (!scorecard.data.hasOwnProperty('show_average_in_row')) {
			data.show_average_in_row = false;
		}
		// attach show_average_in_column if none is defined
		if (!scorecard.data.hasOwnProperty('show_average_in_column')) {
			data.show_average_in_column = false;
		}
		// attach a property empty row if none is defined
		if (!scorecard.data.hasOwnProperty('empty_rows')) {
			data.empty_rows = true;
		}
		if (!scorecard.data.hasOwnProperty('show_data_in_column')) {
			data.show_data_in_column = false;
		}
		if (!scorecard.data.hasOwnProperty('show_league_table')) {
			data.show_league_table = false;
		}
		if (!scorecard.data.hasOwnProperty('show_league_table_all')) {
			data.show_league_table_all = false;
		}
		return {...scorecard, data};
	}

	isArray(o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	}

	// get the starting id for the indicator holder
	getStartingIndicatorId(indicator_holders): number {
		let last_id = 1;
		for (const holder of indicator_holders) {
			if (holder.holder_id > last_id) {
				last_id = holder.holder_id;
			}
		}
		return last_id;
	}

	// try to deduce last number needed to start adding holder group
	getStartingGroupHolderId(indicator_holder_groups): number {
		let last_id = 1;
		for (const group of indicator_holder_groups) {
			if (group.id > last_id) {
				last_id = group.id;
			}
		}
		return last_id;
	}

	//  check if the indicator is already added in a scorecard
	indicatorExist(holders, indicator): boolean {
		let check = false;
		for (const holder of holders) {
			for (const indicatorValue of holder.indicators) {
				if (indicator && indicatorValue.id === indicator.id) {
					check = true;
				}
			}
		}
		return check;
	}

	// find the position of the selected Indicator
	findSelectedIndicatorIndex(current_id, group) {
		let i = 0;
		let index = group.indicator_holder_ids.length;
		for (const item of group.indicator_holder_ids) {
			i++;
			if (item === current_id) {
				index = i;
			}
		}
		return index;
	}

	// use to deduce the indicator legend set from the scorecard glabal set
	getIndicatorLegendSet(legendset_definitions) {
		const legend_length = legendset_definitions.length - 2;
		const indicator_legend = [];
		let initial_value = 100;

		for (const legend of legendset_definitions) {
			if (!legend.hasOwnProperty('default')) {
				indicator_legend.push({
					color: legend.color,
					min: initial_value - Math.round(100 / legend_length),
					max: initial_value
				});
			}
			initial_value = initial_value - Math.round(100 / legend_length);
		}
		return indicator_legend;
	}

	// add an indicator holder to a scorecard
	addIndicatorHolder(indicator_holder, indicator_holders_list): IndicatorHolder[] {
		let add_new = true;
		const indicator_holders = indicator_holders_list.slice();
		for (let holder of indicator_holders) {
			if (holder.holder_id === indicator_holder.holder_id) {
				holder = indicator_holder;
				add_new = false;
			}
		}
		if (add_new) {
			indicator_holders.push(indicator_holder);
		}
		return indicator_holders;
	}

	// add a group of holders to a scorecard
	addHolderGroups(indicator_holder_groups, holder_group, holder, current_id: any = null): void {
		this.store.dispatch(new createActions.SetNeedForGroup(true));
		let add_new = true;
		const old_holder_groups = indicator_holder_groups.slice();
		let new_holder_groups = [];
		const new_holder_group = { ...holder_group };
		for (let group of old_holder_groups) {
			if (group.id === holder_group.id) {
				if (group.indicator_holder_ids.indexOf(holder.holder_id) === -1) {
					const index = this.findSelectedIndicatorIndex(current_id, group);
					let indicator_holder_ids = group.indicator_holder_ids;
					indicator_holder_ids = indicator_holder_ids.concat(holder.holder_id);
					group = {...group, indicator_holder_ids };
				}
				add_new = false;
			}
			new_holder_groups.push(group);
		}

		if (add_new) {
			// TODO: check what this is doing --->> this.deleting[holder_group.id] = false;
			if (new_holder_group.indicator_holder_ids.indexOf(holder.holder_id) === -1) {
				new_holder_group.indicator_holder_ids = [ ...new_holder_group.indicator_holder_ids, holder.holder_id ];
			}
			new_holder_groups = [ ...new_holder_groups, new_holder_group ];
		}
		this.store.dispatch(new createActions.SetHoldersGroups(new_holder_groups.slice()));
	}

	// enable adding of new Indicator
	enableAddIndicator(
		indicator_holders_list,
		indicator_holder_group_list,
		current_holder_group,
		current_id: any = null
	): void {
		const current_group_id = this.getStartingIndicatorId(indicator_holders_list) + 1;
		const current_indicator_holder = {
			holder_id: current_group_id,
			indicators: []
		};

		this.cleanUpEmptyColumns(indicator_holders_list, indicator_holder_group_list);

		this.store.dispatch(new createActions.SetNeedForIndicator(false));
		const indicator_holders = this.addIndicatorHolder(current_indicator_holder, indicator_holders_list);
		this.store.dispatch(new createActions.SetHolders(indicator_holders));
		this.store.dispatch(new createActions.SetCurrentIndicatorHolder(current_indicator_holder));
		this.addHolderGroups(indicator_holder_group_list, current_holder_group, current_indicator_holder, current_id);
	}

	//  pass through the scorecard and delete all empty rows
	cleanUpEmptyColumns(indicator_holders_list, indicator_holder_group_list) {
		let deleted_id = null;
		const indicator_holders = indicator_holders_list.slice();
		const old_indicator_holder_groups = indicator_holder_group_list.slice();
		const indicator_holder_groups = [];
		indicator_holders.forEach((item, index) => {
			if (item.indicators.length === 0) {
				deleted_id = item.holder_id;
				indicator_holders.splice(index, 1);
			}
		});
		old_indicator_holder_groups.forEach((group, groupIndex) => {
			const indicator_holder_ids = [];
			group.indicator_holder_ids.forEach((item, index) => {
				if (item !== deleted_id) {
					indicator_holder_ids.push(item);
				}
				group = {...group, indicator_holder_ids};
			});
			if (group.indicator_holder_ids.length > 0) {
				indicator_holder_groups.push(group);
			}
		});
		this.store.dispatch(new createActions.SetHolders(indicator_holders));
		this.store.dispatch(new createActions.SetHoldersGroups(indicator_holder_groups));
	}

	//  function to remove the indicator holder group form the scorecard
	deleteGroup(holderGroup, indicator_holders_list, indicator_holder_groups_list) {
		const indicator_holders = indicator_holders_list.slice();
		const indicator_holder_groups = indicator_holder_groups_list.slice();
		for (const holder of holderGroup.indicator_holder_ids) {
			indicator_holders.forEach((item, index) => {
				if (item.holder_id === holder) {
					indicator_holders.splice(index, 1);
				}
			});
		}
		indicator_holder_groups.forEach((item, index) => {
			if (item.id === holderGroup.id) {
				indicator_holder_groups.splice(index, 1);
			}
		});
		this.store.dispatch(new createActions.SetHolders(indicator_holders));
		this.store.dispatch(new createActions.SetHoldersGroups(indicator_holder_groups));
	}

	//  deleting indicator from score card
	deleteIndicator(indicator_to_delete, indicator_holders, indicator_holder_groups): void {
		const new_indicator_holders = [];
		indicator_holders.forEach((holder) => {
			const indicators = [];
			holder.indicators.forEach((indicator, indicator_index) => {
				if (indicator.id !== indicator_to_delete.id) {
					indicators.push(indicator);
				}
			});
			holder = {...holder, indicators};
			new_indicator_holders.push(holder);
		});
		this.store.dispatch(new createActions.SetHolders(new_indicator_holders));
		this.store.dispatch(new createActions.SetHoldersGroups(indicator_holder_groups));
		setTimeout(() => {
			this.cleanUpEmptyColumns(new_indicator_holders, indicator_holder_groups);
		});
	}

	//  this will enable updating of indicator
	setCurrentIndicator(indicator: any, indicator_holder_groups, indicator_holders): void {
		const current_indicator_holder = indicator;
		let current_holder_group = null;
		this.store.dispatch(new createActions.SetNeedForIndicator(true));
		indicator_holder_groups.forEach((group, groupIndex) => {
			if (group.indicator_holder_ids.indexOf(indicator.holder_id) > -1) {
				current_holder_group = group;
			}
		});
		this.store.dispatch(new createActions.SetCurrentGroup(current_holder_group));
		this.store.dispatch(new createActions.SetCurrentIndicatorHolder(current_indicator_holder));
		this.cleanUpEmptyColumns(indicator_holders, indicator_holder_groups);
	}

	// load a single item for use in a score card
	load_item(
		item,
		indicator_holders,
		indicator_holder_groups,
		current_indicator_holder,
		current_holder_group,
		legendset_definitions,
		additional_labels,
		group_type,
		active_group,
		pair = false,
		from_drag = false,
		ordered_list = []
	): void {
		if (this.indicatorExist(indicator_holders, item)) {
			if (!from_drag) {
				if (
					current_indicator_holder.indicators[0].id === item.id &&
					current_indicator_holder.indicators.length === 1
				) {
					if (ordered_list.length > 1) {
						const index = _.findIndex(ordered_list, {
							holder_id: current_indicator_holder.holder_id
						});
						this.setCurrentIndicator(ordered_list[index - 1], indicator_holder_groups, indicator_holders);
					}
				}
				this.deleteIndicator(item, indicator_holders, indicator_holder_groups);
			}
		} else {
			const starting_legend = this.getIndicatorLegendSet(legendset_definitions);
			const indicator = this.getIndicatorStructure(item.name, item.id, starting_legend);
			if (group_type === 'functions') {
				indicator.calculation = 'custom_function';
				indicator.function_to_use = active_group;
			}
			indicator.value = Math.floor(Math.random() * 60) + 40;
			const random = Math.floor(Math.random() * 6) + 1;
			if (random % 2 === 0) {
				indicator.showTopArrow = true;
				indicator.showBottomArrow = false;
			} else {
				indicator.showBottomArrow = true;
				indicator.showTopArrow = false;
			}
			// ensure indicator has all additinal labels
			for (const label of additional_labels) {
				indicator.additional_label_values[label] = '';
			}
			// this.current_indicator_holder.holder_id = this.current_group_id;
			if (current_indicator_holder.indicators.length < 2 && pair) {
				const indicators = _.map(current_indicator_holder.indicators, _.cloneDeep);
				indicators.push(indicator);
				current_indicator_holder = {...current_indicator_holder, indicators};
			} else {
				const current_group_id = this.getStartingIndicatorId(indicator_holders) + 1;
				current_indicator_holder = {
					holder_id: current_group_id,
					indicators: []
				};
				const indicators = _.map(current_indicator_holder.indicators, _.cloneDeep);
				indicators.push(indicator);
				current_indicator_holder = {...current_indicator_holder, indicators};
				this.store.dispatch(new createActions.SetNeedForIndicator(false));
				this.cleanUpEmptyColumns(indicator_holders, indicator_holder_groups);
			}
			const new_indicator_holders = this.addIndicatorHolder(current_indicator_holder, indicator_holders);
			this.store.dispatch(new createActions.SetHolders(new_indicator_holders));
			this.store.dispatch(new createActions.SetCurrentIndicatorHolder(current_indicator_holder));
			this.store.dispatch(new createActions.SetNeedForIndicator(true));
			this.addHolderGroups(indicator_holder_groups, current_holder_group, current_indicator_holder);
		}
	}

	// helper function to dynamical provide colspan attribute for a group
	getGroupColspan(group_holders, indicator_holders, periods_list, hidenColums) {
		return (
			_.filter(indicator_holders, (holder: any) => {
				return (
					_.includes(group_holders, holder.holder_id) &&
					_.difference(_.map(holder.indicators, (indicator: any) => indicator.id), hidenColums).length !== 0
				);
			}).length * periods_list.length
		);
	}

	// A function used to decouple indicator list and prepare them for a display
	getSubscorecardColspan(scorecard: ScoreCard, periods_list, hidenColums) {
		let indicators_list = 0;
		for (const holder_group of scorecard.data.data_settings.indicator_holder_groups) {
			indicators_list += this.getGroupColspan(
				holder_group.indicator_holder_ids,
				scorecard.data.data_settings.indicator_holders,
				periods_list,
				hidenColums
			);
		}
		if (scorecard.data.show_sum_in_row) {
			indicators_list++;
		}
		if (scorecard.data.show_average_in_row) {
			indicators_list++;
		}
		if (scorecard.data.show_rank) {
			indicators_list++;
		}
		return indicators_list + 1;
	}

	// simplify title displaying by switching between two or on indicator
	getIndicatorTitle(holder, hidenColums): string {
		return _.map(
			_.filter(holder.indicators, (indicator: any) => hidenColums.indexOf(indicator.id) === -1),
			(indicator: any) => indicator.title
		).join(' / ');
	}

	// helper function to set label value( helpful when there is more than one indicator)
	getIndicatorLabel(indicator, label, hidenColums) {
		const labels = [];
		for (const data of indicator.indicators) {
			if (
				data.additional_label_values[label] !== null &&
				data.additional_label_values[label] !== '' &&
				hidenColums.indexOf(data.id) === -1
			) {
				labels.push(data.additional_label_values[label]);
			}
		}
		return labels.join(' / ');
	}

	findRowAverage(orgunit_id, periods_list, period, indicator_holders, hidenColums) {
		let sum = 0;
		let counter = 0;
		if (period === null) {
			for (const holder of indicator_holders) {
				for (const indicator of holder.indicators) {
					for (const per of periods_list) {
						const use_key = orgunit_id + '.' + per.id;
						if (hidenColums.indexOf(indicator.id) === -1 && indicator.values[use_key] !== null) {
							counter++;
							sum += !isNaN(indicator.values[use_key]) ? parseFloat(indicator.values[use_key]) : 0;
						}
					}
				}
			}
		} else {
			const use_key = orgunit_id + '.' + period;
			for (const holder of indicator_holders) {
				for (const indicator of holder.indicators) {
					if (hidenColums.indexOf(indicator.id) === -1 && indicator.values[use_key] !== null) {
						counter++;
						sum += !isNaN(indicator.values[use_key]) ? parseFloat(indicator.values[use_key]) : 0;
					}
				}
			}
		}

		return (sum / counter).toFixed(2);
	}

	findRowZAverage(orgunit_id, periods_list, period, indicator_holders, hidenColums) {
		let sum = 0;
		let counter = 0;
		if (period !== null) {
			const use_key: any = orgunit_id + '.' + period;
			for (const holder of indicator_holders) {
				for (const indicator of holder.indicators) {
					const item: any = _.find(indicator.key_values, { key: use_key });
					if (hidenColums.indexOf(indicator.id) === -1 && item) {
						counter++;
						sum += !isNaN(item.value) ? parseFloat(item.value) : 0;
					}
				}
			}
		} else {
			for (const holder of indicator_holders) {
				for (const indicator of holder.indicators) {
					for (const per of periods_list) {
						const use_key: any = orgunit_id + '.' + per.id;
						const item: any = _.find(indicator.key_values, { key: use_key });
						if (hidenColums.indexOf(indicator.id) === -1 && item) {
							counter++;
							sum += !isNaN(item.value) ? parseFloat(item.value) : 0;
						}
					}
				}
			}
		}

		return (sum / counter).toFixed(2);
	}


	findRowTotalAverage(orgunits, period, indicator_holders, hidenColums) {
		let sum = 0;
		let n = 0;
		for (const holder of indicator_holders) {
			for (const indicator of holder.indicators) {
				if (hidenColums.indexOf(indicator.id) === -1) {
					for (const orgunit of orgunits) {
						const usekey = orgunit.id + '.' + period;
						if (indicator.values) {
							if (usekey in indicator.values && indicator.values[usekey] !== null) {
								n++;
								sum += !isNaN(indicator.values[usekey]) ? parseFloat(indicator.values[usekey]) : 0;
							}
						}
					}
				}
			}
		}
		return (sum / n).toFixed(2);
	}

	findRowTotalSum(orgunits, period, indicator_holders, hidenColums) {
		let sum = 0;
		let n = 0;
		for (const holder of indicator_holders) {
			for (const indicator of holder.indicators) {
				if (hidenColums.indexOf(indicator.id) === -1) {
					for (const orgunit of orgunits) {
						const use_key = orgunit.id + '.' + period;
						if (orgunit.id in indicator.values && indicator.values[use_key] !== null) {
							n++;
							sum = sum + parseFloat(indicator.values[use_key]);
						}
					}
				}
			}
		}
		return sum;
	}
}
