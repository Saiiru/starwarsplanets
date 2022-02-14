import Card from '../Card'

export default function CardList({planets}) {

  return (
     <div className='container'>
     {planets.map(data =>   <Card key={data.id} data={data} />)}
  </div>
  )
}
