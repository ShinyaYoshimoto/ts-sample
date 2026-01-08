export const typeDefs = `
  type User {
    id: ID!
    email: String!
    name: String!
  }

  type ValidationError {
    message: String!
    field: String
  }

  type ConflictError {
    message: String!
    conflictingId: ID
  }

  union RegisterUserResult = User | ValidationError | ConflictError

  type Query {
    hello: String!
  }

  type Mutation {
    registerUser(email: String!, name: String!): RegisterUserResult!
  }
`;
