import { useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import Recommend from "./components/Recommend";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [genre, setGenre] = useState("");

  const client = useApolloClient();

  useEffect(() => {
    const token = window.localStorage.getItem("library-user-token");
    if (token) {
      setToken(token);
    }
  }, [setToken]);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={()=> setPage("recommend")}>recommendation</button>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => logout()}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} token={token} />

      <Books
        show={page === "books"}
        genre={genre}
        setGenre={(genre) => setGenre(genre)}
      />

      <NewBook show={page === "add"} selectedGenre = {genre}/>
      <Login
        show={page === "login"}
        setToken={(token) => setToken(token)}
        setPage={(page) => setPage(page)}
      />
      <Recommend show={page==="recommend"}/>
    </div>
  );
};

export default App;
