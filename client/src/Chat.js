import { useState } from "react";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  split,
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  useMutation,
  gql,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:5000/",
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:5000/graphql",
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  uri: "http://localhost:5000/",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) return null;
  console.log(data);

  return (
    <>
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          key={id}
          style={{
            display: "flex",
            justifyContent: user === messageUser ? "flex-end" : "flex-start",
            paddingBottom: "1em",
          }}
        >
          {user !== messageUser && (
            <div
              style={{
                height: 50,
                width: 50,
                marginRight: "0.5em",
                border: "2px solid ",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "18pt",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? "lightseagreen" : "#e5e6ea",
              color: user === messageUser ? "white" : "black",
              padding: "1em",
              borderRadius: "1em",
              maxWidth: "60%",
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  );
};

const Chat = () => {
  const [chatState, setChatState] = useState({
    user: "Jack",
    content: "",
  });

  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (chatState.content.length > 0) {
      postMessage({ variables: chatState });
    }

    setChatState({
      ...chatState,
      content: "",
    });
  };

  return (
    <div className="container">
      <h1>Chatty-Chat</h1>
      <Messages user={chatState.user} />
      <div>
        <input
          type="text"
          placeholder="User"
          value={chatState.user}
          onChange={(evt) =>
            setChatState({
              ...chatState,
              user: evt.target.value,
            })
          }
          onKeyUp={(evt) => {
            if (evt.code === 13) {
              onSend();
            }
          }}
        />
        <input
          type="text"
          placeholder="Message..."
          value={chatState.content}
          onChange={(evt) =>
            setChatState({
              ...chatState,
              content: evt.target.value,
            })
          }
        />
        <button onClick={onSend}>Send</button>
      </div>
    </div>
  );
};

const ChatWrapper = () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);

export default ChatWrapper;
