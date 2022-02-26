import React from 'react'
import CardList from './components/CardList'
import Scroll from './components/Scroll'
import SearchBox from './components/SearchBox'
import { connect } from 'react-redux'
import { setSearchField, requestPlanets } from './redux/action'

// parameter state comes from index.js provider store state(rootReducers)
const mapStateToProps = state => {
  return {
    searchField: state.searchPlanets.searchField,
    planets: state.requestPlanets.planets,
    isPending: state.requestPlanets.isPending,
    data: state.requestPlanets.data
  }
}

// dispatch the DOM changes to call an action. note mapStateToProps returns object, mapDispatchToProps returns function
// the function returns an object then uses connect to change the data from redecers.
const mapDispatchToProps = dispatch => {
  return {
    onSearchChange: (e) => {
      dispatch(setSearchField(e.target.value))
    },
    onRequestPlanets: () => dispatch(requestPlanets())
  }
}

function App({ searchField, onSearchChange, onRequestPlanets, planets, isPending, data }) {
  const filteredPlanets = planets.filter(planets => {

    return planets.name.toLowerCase().includes(searchField.toLowerCase())
  })


  React.useEffect(() => {

    onRequestPlanets()

  }, [onRequestPlanets])


return (
    <div className="tc">
      <h1 className="b--black">STAR WARS </h1>
      <SearchBox onSearchChange={onSearchChange} searchField={searchField} />
      <Scroll><CardList planets={filteredPlanets} /></Scroll>

    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
