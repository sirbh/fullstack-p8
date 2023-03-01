import { useQuery } from "@apollo/client"
import { useState } from "react"
import { GET_ALL_BOOKS } from "../queries"

const Books = (props) => {
 
  const books = useQuery(GET_ALL_BOOKS,{
    variables:{
      genre:props.genre
    },
  })

  // const books = useQuery(GET_ALL_BOOKS)



  if (!props.show) {
    return null
  }

  if(books.loading){
    return <div>Loading...</div>
  }

  if(books.error){
    return <div>Something went wrong...</div>
  }

  const allBooks = books.data.allBooks
  const allGenres = allBooks.reduce((genres,book)=>{

      book.genres.forEach(genre=>{
        if(!genres.includes(genre)){
            genres.push(genre)
        }
      })
      return genres
  },[])



  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {allBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={()=>props.setGenre("")}>All</button>
      {allGenres.map(genre=>{
        return <button key = {genre} onClick={()=>{props.setGenre(genre)}}>{genre}</button>
      })}
    </div>
  )
}

export default Books
