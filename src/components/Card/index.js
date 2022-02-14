


const Card = ({data}) => {

  const imgURL = 'https://starwars-visualguide.com/assets/img/planets/'
 function getId(url) {
    return url.split('/')[url.split('/').length - 2]
  }

  return (
  <>
  <div className="tc grow bg-light-blue br3 pa3 ma2 dib bw2 shadow-5">
    <img src={`${imgURL + getId(data.url)}.jpg`} alt="" srcset="" />
    <div>
      <h2>{data.name}</h2>
    </div>
  </div>
</>
)
}



export default Card
