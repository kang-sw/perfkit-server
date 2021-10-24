import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {useInterval} from "./Utils";
import {ApiUrlSessionIdContext} from "./Common";
import {useResizeDetector} from "react-resize-detector";
import {Col, Container, Row, Table} from "react-bootstrap";
import {XTerm} from "xterm-for-react";

interface ShellPacket {
  content: string,
  offset: number,
  sequence: number
}

function SessionTerminal(prop: { url: string, sessionKey: string }) {
  const content = useRef<string>("")
  const tailMarker = useRef<HTMLDivElement>(null);
  const [fetching, setFetching] = useState(false);
  const [charFence, setCharFence] = useState(0);

  useInterval(() => {
    if (fetching)
      return;

    axios
      .get(prop.url + `/shell/${prop.sessionKey}/${charFence}`)
      .then((fetched) => {
        const data: ShellPacket = fetched.data;
        setCharFence(data.sequence)
        content.current += data.content;

        if (content.current.length > 100000) {
          content.current = content.current.substr(content.current.length - 80000)
        }
        tailMarker.current?.scrollIntoView()
      }).catch((error) => 0)
  }, 1000 / 10)

  return <p style={
    {
      fontFamily: "consolas",
      border: "1px solid #cccccc",
      flex: "1 0 0",
      maxWidth: "80vw",
      height: "40vh",
      overflow: "auto",
      padding: 4,
      whiteSpace: "pre-wrap"
    }}>
    {content.current}
    <div ref={tailMarker}/>
  </p>
}

export function SessionDashboard(prop: { url: string, sessionKey: string, }) {
  return <ApiUrlSessionIdContext.Provider value={{url: prop.url, sessionId: prop.sessionKey}}>
    <h5>| Terminal</h5>
    <SessionTerminal url={prop.url} sessionKey={prop.sessionKey}/>
  </ApiUrlSessionIdContext.Provider>
}