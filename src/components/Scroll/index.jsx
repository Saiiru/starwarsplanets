import React from 'react'

function Scroll({children}) {
  return (
    <div style={{overflowY:'scroll', border: '1px solid black ', height: '90%' }} >{children}</div>
  )
}

export default Scroll
