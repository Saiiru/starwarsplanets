import React from 'react'

export default function SearchBox({ onSearchChange, searchField }) {
  return <div className="pa3">
    <label htmlFor="planet-search" className="planet-search-label">Buscar planetas</label>
    <input id="planet-search" className="pa3 ba b--green bg-lightest-blue planet-search-input"
      type="search" placeholder="Ex.: Tatooine" value={searchField} onChange={onSearchChange}/>
  </div>
}
