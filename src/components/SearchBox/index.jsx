import React from 'react'

function SearchBox({onSearchChange, searchField}) {
  return (<div className="pa3">
    <input  className="pa3 ba b--green bg-lightest-blue "  type="search" placeholder="puta" onChange={onSearchChange}/>
  </div>
  )
}

export default SearchBox
