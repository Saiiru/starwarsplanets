import React from 'react'

export default function Card({ data }) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const id = /^https?:\/\//.test(data.url || '') ? (data.url.match(/\/planets\/(\d+)\/?/) || [])[1] : null
  return <article className="planet-card">
    {!imageFailed && id
      ? <img loading="lazy" src={`https://starwars-visualguide.com/assets/img/planets/${id}.jpg`}
          alt={`Ilustração do planeta ${data.name}`} onError={() => setImageFailed(true)}/>
      : <div className="planet-placeholder" role="img" aria-label={`Sem imagem disponível para ${data.name}`}>✦</div>}
    <div className="planet-card-content">
      <h2>{data.name}</h2>
      <p>Clima: {data.climate || 'não informado'}</p>
      <p>População: {data.population || 'não informada'}</p>
    </div>
  </article>
}
