"use strict";

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  type Message {\n    id: ID!\n    user: String!\n    content: String!\n  }\n\n  type Query {\n    messages: [Message!]\n  }\n\n  type Mutation {\n    postMessage(user: String!, content: String!): ID!\n  }\n\n  type Subscription {\n    messages: [Message!]\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require("apollo-server"),
    PubSub = _require.PubSub,
    ApolloServer = _require.ApolloServer;

var gql = require("graphql-tag");

var pubsub = new PubSub();
var _messages = [];
var typeDefs = gql(_templateObject());
var subscribers = [];

var onMessagesUpdate = function onMessagesUpdate(fn) {
  return subscribers.push(fn);
};

var resolvers = {
  Query: {
    messages: function messages() {
      return _messages;
    }
  },
  Mutation: {
    postMessage: function postMessage(_, _ref) {
      var user = _ref.user,
          content = _ref.content;
      var id = _messages.length;

      _messages.push({
        id: id,
        user: user,
        content: content
      });

      subscribers.forEach(function (fn) {
        return fn();
      });
      return id;
    }
  },
  Subscription: {
    messages: {
      subscribe: function subscribe(_, __, _ref2) {
        var pubsub = _ref2.pubsub;
        var channel = Math.random().toString(36).slice(2, 15);
        onMessagesUpdate(function () {
          return pubsub.publish(channel, {
            messages: _messages
          });
        });
        setTimeout(function () {
          return pubsub.publish(channel, {
            messages: _messages
          });
        }, 0);
        return pubsub.asyncIterator(channel);
      }
    }
  }
};
var server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: {
    pubsub: pubsub
  }
});
server.listen({
  port: 5000
}).then(function (_ref3) {
  var url = _ref3.url;
  console.log("\uD83D\uDE80 Server running at ".concat(url));
});