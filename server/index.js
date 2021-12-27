const { PubSub, ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");

const pubsub = new PubSub();
const messages = [];

const typeDefs = gql`
  type Message {
    id: ID!
    user: String!
    content: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, content: String!): ID!
  }

  type Subscription {
    messages: [Message!]
  }
`;

const subscribers = [];
const onMessagesUpdate = (fn) => subscribers.push(fn);

const resolvers = {
  Query: {
    messages: () => messages,
  },

  Mutation: {
    postMessage: (_, { user, content }) => {
      const id = messages.length;
      messages.push({
        id,
        user,
        content,
      });
      subscribers.forEach((fn) => fn());
      return id;
    },
  },

  Subscription: {
    messages: {
      subscribe: (_, __, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15);
        onMessagesUpdate(() => pubsub.publish(channel, { messages }));
        setTimeout(() => pubsub.publish(channel, { messages }), 0);
        return pubsub.asyncIterator(channel);
      },
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { pubsub },
});

server.listen({ port: 5000 }).then(({ url }) => {
  console.log(`🚀 Server running at ${url}`);
});
