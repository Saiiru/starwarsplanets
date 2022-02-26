
import {
  CHANGE_SEARCH_FIELD,
  REQUEST_PLANETS_PENDING,
  REQUEST_PLANETS_SUCCESS,
  REQUEST_PLANETS_FAILED
} from "./constants"


const initialSearchState = {
  searchField: ""
}

export const searchPlanets = (state = initialSearchState, action = {}) => {
  switch (action.type) {
    case CHANGE_SEARCH_FIELD: {
      return Object.assign({}, state, {searchField: action.payload})
    }
    default:
      return state
  }
}

const initialPlanetsState = {
  planets: [],
  isPending: false,

}

export const requestPlanets = (state = initialPlanetsState, action = {}) => {
  switch (action.type) {
    case REQUEST_PLANETS_PENDING:
      return Object.assign({}, state, {isPending: true})
    case REQUEST_PLANETS_SUCCESS:
      return Object.assign({}, state, {data: action.payload, planets: action.payload.results, isPending: false})
    case REQUEST_PLANETS_FAILED:
      return Object.assign({}, state, {error: action.payload})
    default:
      return state
  }
}
