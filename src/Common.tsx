import React from "react";

export const ApiServerUrlContext = React.createContext("");

interface ApiUrlSessionId {
  url: string,
  sessionId: string,
}

export const ApiUrlSessionIdContext = React.createContext<ApiUrlSessionId>({
  url: "",
  sessionId: ""
});

