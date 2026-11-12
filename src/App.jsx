import React from 'react'
import { connect } from 'react-redux'
import CardList from './components/CardList'
import Scroll from './components/Scroll'
import SearchBox from './components/SearchBox'
import { setSearchField, requestPlanets } from './redux/action'

const mapStateToProps = state => ({
  searchField: state.searchPlanets.searchField,
  planets: state.requestPlanets.planets,
  isPending: state.requestPlanets.isPending,
  error: state.requestPlanets.error
})

const mapDispatchToProps = dispatch => ({
  onSearchChange: event => dispatch(setSearchField(event.target.value)),
  onRequestPlanets: () => dispatch(requestPlanets())
})

function App({ searchField, onSearchChange, onRequestPlanets, planets, isPending, error }) {
  React.useEffect(() => { onRequestPlanets() }, [onRequestPlanets])
  const filtered = planets.filter(planet => planet.name.toLocaleLowerCase().includes(searchField.toLocaleLowerCase()))
  return (
    <main className="tc planet-explorer">
      <header className="planet-hero">
        <p className="planet-eyebrow">LABORATÓRIO REACT + REDUX / SWAPI</p>
        <h1>STAR WARS <span>PLANET EXPLORER</span></h1>
        <p>Explore os planetas catalogados pela API pública de Star Wars. Pesquisa sem alterar a fonte original.</p>
        <a href="https://github.com/Saiiru/starwarsplanets" target="_blank" rel="noreferrer">Código e documentação</a>
      </header>
      <SearchBox onSearchChange={onSearchChange} searchField={searchField} />
      {isPending && <p role="status">Carregando planetas…</p>}
      {error && <div role="alert" className="planet-error">Não foi possível consultar a API: {error}. <button type="button" onClick={onRequestPlanets}>Tentar novamente</button></div>}
      {!isPending && !error && <p role="status" className="planet-results">{filtered.length} de {planets.length} planetas encontrados</p>}
      {!isPending && !error && filtered.length === 0 && <p>Nenhum planeta corresponde à sua busca.</p>}
      <Scroll><CardList planets={filtered}/></Scroll>
    </main>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
