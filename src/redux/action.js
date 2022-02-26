import { apiCall } from "../api/api"
import {
  CHANGE_SEARCH_FIELD,
  REQUEST_PLANETS_PENDING,
  REQUEST_PLANETS_SUCCESS,
  REQUEST_PLANETS_FAILED
} from "./constants"

export const setSearchField = (text) => ({ type: CHANGE_SEARCH_FIELD,  payload: text })


export const requestPlanets = () => (dispatch) => {
  dispatch({ type: REQUEST_PLANETS_PENDING })
  apiCall(`https://swapi.dev/api/planets/`)
    .then(data => dispatch({ type: REQUEST_PLANETS_SUCCESS, payload: data }))
    .catch(error => dispatch({ type: REQUEST_PLANETS_FAILED, payload: error }))
}

