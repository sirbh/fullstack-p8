import { gql } from "@apollo/client";

export const GET_ALL_AUTHORS = gql`
  query {
    allAuthors {
      born
      id
      bookCount
      name
    }
  }
`;

export const GET_ALL_BOOKS = gql`
  query ($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      id
      published
      title
      genres
      author {
        name
        born
      }
    }
  }
`;

export const ADD_BOOK = gql`
  mutation (
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      author {
        name
        bookCount
      }
      genres
      id
      published
      title
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation ($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born) {
      name
      born
      id
    }
  }
`;

export const LOGIN = gql`
  mutation ($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ME = gql`
  query {
    me {
      id
      username
      favouriteGenre
    }
  }
`;
