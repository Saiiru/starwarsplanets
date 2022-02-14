import axios from 'axios'
import React from 'react'
import CardList from './components/CardList'
import Scroll from './components/Scroll'
import SearchBox from './components/SearchBox'
const teste = {
    name: 'Tatooine',
    url: 'https://jkhub.org/wiki/images/0/01/Tatooine.png'
  }
function App() {
const  [searchField, setSearchField] = React.useState('')
const  [planets, setPlanets] = React.useState([])


const fetchPlanets = async () => {
  const response = await axios.get(`https://swapi.dev/api/planets/`);

  const data = response.data

  setPlanets(data.results);
};


React.useEffect(()=>{console.log('check')
fetchPlanets(planets)

},[])

function onSearchChange(e) {
  setSearchField(e.target.value)

}
 const filteredPlanets = planets.filter(planets => {

    return planets.name.toLowerCase().includes(searchField.toLowerCase())
  })

  return (
    <div className="tc">
    <h1 className="b--black">STAR WARS </h1>
    <SearchBox onSearchChange={onSearchChange} searchField={searchField} />
    <Scroll><CardList planets={filteredPlanets} /></Scroll>

  </div>
  )
}

export default App
