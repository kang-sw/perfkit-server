import "bootstrap/dist/css/bootstrap.min.css"
import {Button, Container, Row, Col} from "react-bootstrap"
import React, {useEffect, useState} from "react"
import DockLayout, {LayoutData} from "rc-dock"
import "rc-dock/dist/rc-dock.css"
import {ApiServerUrlContext} from "./Common";
import {useInterval, useIntervalImmediate} from "./Utils"
import axios from "axios";

interface SessionInfo {
  name: string;
  ip: string;
  pid: number;
  machine_name: string;
  epoch: number;
  description: string;
}

function SessionListArgument(prop: { info: SessionInfo }) {
  console.log(JSON.stringify(prop.info));

  return <Button>
    NAME: {prop.info.name}<br/>
    IP: {prop.info.ip}<br/>
    PID: {prop.info.pid}<br/>
    MACHINE_NAME: {prop.info.machine_name}<br/>
    EPOCH: {(new Date(prop.info.epoch)).toDateString()}<br/>
    DESCRIPTION: {prop.info.description}
  </Button>;
}


export function SessionListPanel(prop: { url: string }) {
  const [sessionList, setSessionList] = useState([]);
  const [sessionFence, setSessionFence] = useState(0);

  const fetchSession = () => {
    axios.get(prop.url + "/sessions").then(
      (obj) => {
        console.log(`fetched: ${JSON.stringify(obj.data)}`);
        const sessions: { [key: string]: SessionInfo } = obj.data['sessions'];
        console.log(`fetched: ${JSON.stringify(sessions)}`);

        let sessList: any = [];

        for (const key in sessions) {
          console.log(`${key} => ${sessions[key]}`);
          sessList.push(
            <SessionListArgument info={sessions[key]} key={key}/>);
        }

        console.log(`result list: ${JSON.stringify(sessList)}`);
        setSessionList(sessList);
      }
    ).catch((err) => {
      console.log(`${err}: ${JSON.stringify(err)}`);
    })
  };

  useInterval(
    () => setSessionFence(sessionFence + 1),
    10000
  );

  useEffect(
    fetchSession,
    [sessionFence]
  );

  return <div>
    {`target url is ${prop.url} 데스`}
    <Container>
      {sessionList === [] ? "no sessions available" : sessionList}
    </Container>
  </div>
}
