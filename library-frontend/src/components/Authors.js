import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ALL_AUTHORS, UPDATE_AUTHOR } from "../queries";

const Authors = (props) => {
  const authors = useQuery(GET_ALL_AUTHORS);

  useEffect(() => {
    if (authors.data) {
      setName(authors.data.allAuthors[0].name);
    }
  }, [authors.data]);

  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [updateAuthor] = useMutation(UPDATE_AUTHOR);

  const submit = (e) => {
    e.preventDefault();
    updateAuthor({
      variables: {
        name,
        born: parseInt(born),
      },
    });

    setBorn("");
    setName("");
  };

  if (!props.show) {
    return null;
  }

  if (authors.loading) {
    return <div>Loading...</div>;
  }

  if (authors.error) {
    return <div>Something went wrong...</div>;
  }

  const allAuthors = authors.data.allAuthors;

  return (
    <>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {allAuthors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Set birthyear</h3>
        {props.token ? (
          <form onSubmit={submit}>
            <select
              name="authors"
              onChange={({ target }) => {
                setName(target.value);
              }}
              value={name}
            >
              {allAuthors.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <div>
              born
              <input
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        ) : (
          <div>{"please authenticate for editing"}</div>
        )}
      </div>
    </>
  );
};

export default Authors;
