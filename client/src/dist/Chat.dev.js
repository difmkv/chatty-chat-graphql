"use strict";

var _client = require("@apollo/client");

var client = new _client.ApolloClient({
  uri: "http://localhost:5000/",
  cache: new _client.InMemoryCache()
});