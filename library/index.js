const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { randomUUID } = require("crypto");
const { GraphQLError } = require("graphql");
const mongoose = require("mongoose");
const Author = require("./models/author");
mongoose.set("strictQuery", false);
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

/*
 you can remove the placeholder query once your first own has been implemented 
*/

const typeDefs = `
  type User {
  username: String!
  favouriteGenre: String!
  id: ID!
  }

  type Token {
  value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author:String,genre:String):[Book]!
    allAuthors:[Author!]!
    me: User
  }

  type Book {
    title:String!
    published:Int!
    author:Author!
    id:ID!
    genres:[String!]!
  }

  type Author {
    name:String!
    id:ID!
    born:Int
    bookCount:Int!
  }

  type Mutation {
    addBook(
        title:String!
        published:Int!
        author:String!
        genres:[String!]!
        ):Book
    editAuthor(
        name:String!
        born:Int!
        ):Author
    createUser(
          username: String!
          favouriteGenre: String!
        ): User
    login(
          username: String!
          password: String!
        ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.count(),
    authorCount: async () => Author.count(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate("author");
      }
      const books = await Book.find({}).populate("author");
      console.log(books);
      let filteredBooks;
      if (args.author) {
        filteredBooks = books.filter((book) => {
          return book.author.name === args.author;
        });
      }
      if (args.genre) {
        if (filteredBooks) {
          return filteredBooks.filter((book) =>
            book.genres.includes(args.genre)
          );
        }
        filteredBooks = books.filter((book) =>
          book.genres.includes(args.genre)
        );
      }
      return filteredBooks;
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author')
      return books.filter(book=>{
        return book.author.name===root.name
      }).length
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOne({ name: args.author });

      if (author) {
        const book = new Book({
          ...args,
          author: author.id,
        });
        let savedBook;
        try {
          savedBook = await (await book.save()).populate("author");
        } catch (error) {
          throw new GraphQLError("Saving book failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
        // const savedBook = await (await book.save()).populate("author");  //error handling
        return savedBook;
      }
      const newAuthor = new Author({
        name: args.author,
      });
      let savedAuthor;
      try {
        savedAuthor = await newAuthor.save();
      } catch (error) {
        throw new GraphQLError("Saving Author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      const book = new Book({
        ...args,
        author: savedAuthor.id,
      });
      let savedBook;
      try {
        savedBook = await (await book.save()).populate("author");
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      // const savedBook = await (await book.save()).populate("author");  //error handling
      return savedBook;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.born },
        {
          new: true,
        }
      );
      return author
      // const authorIndex = authors.findIndex(
      //   (author) => author.name === args.name
      // );
      // if (authorIndex >= 0) {
      //   authors[authorIndex].born = args.born;
      //   return authors[authorIndex];
      // }
    },
    createUser: async (root, args) => {
      const user = new User({
        ...args,
      });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
