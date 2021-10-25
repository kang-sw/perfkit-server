import React from "react";
import axios, {AxiosRequestConfig} from "axios";

export const ApiServerUrlContext = React.createContext("");
export let axiosInstance = axios.create();

export function RefreshAxiosInstance(param : AxiosRequestConfig){
  axiosInstance = axios.create(param);
}

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

