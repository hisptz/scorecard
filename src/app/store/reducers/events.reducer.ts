import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as EventDataActions from '../actions/events.actions';
import {EventData} from '../../shared/services/event-data.service';

export interface EventDataState extends EntityState<EventData> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: EventData, b: EventData): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<EventData> = createEntityAdapter<EventData>({
  sortComparer: sortByName,
});

export const initialState: EventDataState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function eventsReducer(
  state = initialState,
  action: EventDataActions.EventGroupsActions
): EventDataState {
  switch (action.type) {
    case (EventDataActions.LOAD_EVENT_GROUP): {
      return {
        ...state,
        loading: true
      };
    }

    case (EventDataActions.LOAD_EVENT_GROUP_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (EventDataActions.LOAD_EVENT_GROUP_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getEventDataLoading = (state: EventDataState) => state.loading;
export const getEventDataLoaded = (state: EventDataState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectEventDataEntities,

  // select the array of users
  selectAll: selectAllEventData,

} = adapter.getSelectors();
