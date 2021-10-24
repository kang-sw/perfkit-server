import React from "react";
import axios from "axios";

export const ApiServerUrlContext = React.createContext("");
export let axiosInstance = axios.create();

interface ApiUrlSessionId {
  url: string,
  sessionKey: string,
  notifySessionDie: (sessionKey:string) => void
}

export const ApiUrlSessionIdContext = React.createContext<ApiUrlSessionId>({
    url: "", sessionKey: "",
    notifySessionDie: ((sessionKey) => {
    })
  }
);

