﻿import { Action } from '@ngrx/store';
import { tassign } from 'tassign';
import { Trip, TripHolder, TripCriteria } from './trip.model';
import { Tab } from '../app-shared/tabset/tab.model';
import { type, buildReducer } from '../app-shared/type-cache';

export type SearchStatus = 'ready' | 'searching' | 'empty' | 'complete';
export interface TripState {
    criteria: TripCriteria,
    searchStatus: SearchStatus;
    results: Trip[],
    openList: TripHolder[],
    activeTabId: string,
    nextNewId: number
}
const initialState: TripState = {
    criteria: null, searchStatus: 'ready', results: [], openList: [], activeTabId: '', nextNewId: 0
};

export class TripSearchAction implements Action {
    type = TripSearchAction.type;
    constructor(public payload: TripCriteria) { }

    static type: string = type('[Trip] Search');
    static reduce(state: TripState, action: TripSearchAction) {
        return tassign(state, {
            criteria: action.payload || {},
            searchStatus: 'searching',
            results: null
        });
    }
}

export class TripSearchCompleteAction implements Action {
    type = TripSearchCompleteAction.type;
    constructor(public payload: Trip[]) { }

    static type: string = type('[Trip] Search Complete');
    static reduce(state: TripState, action: TripSearchCompleteAction) {
        return tassign(state, {
            searchStatus: action.payload.length > 0 ? 'complete' : 'empty',
            results: action.payload
        });
    }
}

export class TripSearchCriteriaChangeAction implements Action {
    type = TripSearchCriteriaChangeAction.type;
    constructor(public payload: TripCriteria) { }

    static type: string = type('[Trip] Search Criteria Change');
    static reduce(state: TripState, action: TripSearchCriteriaChangeAction) {
        return tassign(state, {
            criteria: action.payload || {}
        });
    }
}

export class TripSearchResetAction implements Action {
    type = TripSearchResetAction.type;
    constructor() { }

    static type: string = type('[Trip] Search Reset');
    static reduce(state: TripState, action: TripSearchResetAction) {
        return tassign(state, {
            criteria: {},
            searchStatus: 'ready',
            results: []
        });
    }
}

export class TripOpenAction implements Action {
    type = TripOpenAction.type;
    constructor(public payload: Trip) { }

    static type: string = type('[Trip] Open');
    static reduce(state: TripState, action: TripOpenAction) {
        let oholder = new TripHolder();
        oholder.Trip = action.payload || new Trip();
        if (oholder.Trip.TripId && oholder.Trip.TripId.length > 0) {
            oholder.PlaceholderId = oholder.Trip.TripId;
            var openFilter = state.openList.filter(x => x.Trip.TripId === oholder.Trip.TripId);
            if (openFilter.length > 0) {
                return tassign(state, {
                    activeTabId: oholder.PlaceholderId,
                });
            }
        } else {
            oholder.PlaceholderId = "new-" + state.nextNewId;
        }

        return tassign(state, {
            openList: state.openList.concat([oholder]),
            activeTabId: oholder.PlaceholderId,
            nextNewId: state.nextNewId + 1
        });
    }
}

export class TripTabActivateAction implements Action {
    type = TripTabActivateAction.type;
    constructor(public payload: string) { }

    static type: string = type('[Trip] Tab Activate');
    static reduce(state: TripState, action: TripTabActivateAction) {
        return tassign(state, {
            activeTabId: action.payload
        });
    }
}

export class TripCloseAction implements Action {
    type = TripCloseAction.type;
    constructor(public payload: string) { }

    static type: string = type('[Trip] Close');
    static reduce(state: TripState, action: TripCloseAction) {
        return tassign(state, {
            openList: state.openList.filter(x => x.PlaceholderId !== action.payload),
            activeTabId: state.activeTabId !== action.payload ? state.activeTabId
                : state.openList.length > 0 && state.openList[0].PlaceholderId !== action.payload
                    ? state.openList[0].PlaceholderId
                    : ''
        });
    }
}

export class TripInsertAction implements Action {
    type = TripInsertAction.type;
    constructor(public payload: TripHolder) { }

    static type: string = type('[Trip] Insert Complete');
    static reduce(state: TripState, action: TripInsertAction) {
        let oldId = action.payload.PlaceholderId;
        action.payload.PlaceholderId = action.payload.Trip.TripId;
        return tassign(state, {
            results: [action.payload.Trip].concat(state.results), //add to top
            openList: state.openList.map(i => i.PlaceholderId === oldId ? action.payload : i)
            //TODO: if this was the active tab, the tab id is being updated, so the 'activeTabId' should update to match
        });
    }
}

export class TripUpdateAction implements Action {
    type = TripUpdateAction.type;
    constructor(public payload: TripHolder) { }

    static type: string = type('[Trip] Update Complete');
    static reduce(state: TripState, action: TripUpdateAction) {
        return tassign(state, {
            results: state.results.map(existing => existing.TripId === action.payload.Trip.TripId ? action.payload.Trip : existing),
            openList: state.openList.map(i => i.PlaceholderId === action.payload.PlaceholderId ? action.payload : i)
        });
    }
}

export const TripReducer = buildReducer(initialState,
    TripSearchAction,
    TripSearchCompleteAction,
    TripSearchCriteriaChangeAction,
    TripSearchResetAction,
    TripOpenAction,
    TripTabActivateAction,
    TripCloseAction,
    TripInsertAction,
    TripUpdateAction
);