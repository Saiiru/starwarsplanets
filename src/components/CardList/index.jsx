import Card from '../Card'

export default function CardList({ planets }) {
  return (
    <div className='container'>
      { planets.map((data, i) =>   <Card key={i} data={data} />)
      }


    </div>
  )
}
