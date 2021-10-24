import "bootstrap/dist/css/bootstrap.css"
import {Button, Container, Row, Col} from "react-bootstrap"
import React, {useEffect, useState} from "react"
import DockLayout, {BoxData, LayoutData, PanelBase, PanelData} from "rc-dock"
import "rc-dock/dist/rc-dock.css"
import {ApiServerUrlContext} from "./Common";
import {useInterval, useIntervalImmediate} from "./Utils"
import axios from "axios";
import {stringify} from "querystring";

interface SessionInfo {
  name: string;
  ip: string;
  pid: number;
  machine_name: string;
  epoch: number;
  description: string;
}

function SessionListArgument(prop: { info: SessionInfo, onSelect: () => void }) {
  console.log(JSON.stringify(prop.info));

  function AlignedLabel(prop: { tag: string, content: string }) {
    return <Row>
      <Col className={"text-start"}>{prop.tag}</Col>
      <Col className={"text-end"}>{prop.content}</Col>
    </Row>;
  }

  return <Button className={"bg-secondary w-100 p-2 mb-1"} style={{fontFamily: "Lucida Console"}}
                 onClick={prop.onSelect}>
    <Col className="badge w-100 bg-primary align-self-center fw-bold" style={{fontSize: "1.25em"}}>
      {prop.info.name}
    </Col>
    <Container>
      <AlignedLabel tag={"IP"} content={prop.info.ip}/>
      <AlignedLabel tag={"PID"} content={prop.info.pid.toString()}/>
      <AlignedLabel tag={"EPOCH"} content={(new Date(prop.info.epoch)).toLocaleString()}/>
    </Container>
  </Button>;
}


export function SessionListPanel(prop: { url: string, onSelect: (id: string) => void }) {
  const [sessionList, setSessionList] = useState([]);

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
            <SessionListArgument
              info={sessions[key]}
              key={key}
              onSelect={()=>prop.onSelect(key)}/>);
        }

        console.log(`result list: ${JSON.stringify(sessList)}`);
        setSessionList(sessList);
      }
    ).catch((err) => {
      console.log(`${err}: ${JSON.stringify(err)}`);
    })
  };

  useIntervalImmediate(
    fetchSession,
    10000
  );

  return <div className={"overflow-auto"}>
    <div>.</div>
    <Container>
      {sessionList === [] ? "no sessions available" : sessionList}
    </Container>
  </div>
}
