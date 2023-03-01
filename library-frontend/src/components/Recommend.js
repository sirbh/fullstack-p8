import { useQuery } from "@apollo/client";
import { GET_ALL_BOOKS, ME } from "../queries";

const Recommend = (props) => {
  const { data } = useQuery(ME);
  const books = useQuery(GET_ALL_BOOKS, {
    skip: !data,
    variables: {
      genre: data?data.me.favouriteGenre:"",
    },
  });
  if (!props.show) {
    return null;
  }

  if (!books) {
    return null;
  }

  if (books.loading) {
    return <div>Loading...</div>;
  }

  if (books.error) {
    return <div>Something went wrong</div>;
  }
  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favourite <strong>genre</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
