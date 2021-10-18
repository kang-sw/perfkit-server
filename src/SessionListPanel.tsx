import "bootstrap/dist/css/bootstrap.css"
import {Button, Container, Row, Col} from "react-bootstrap"
import React, {useEffect, useState} from "react"
import DockLayout, {BoxData, LayoutData, PanelBase, PanelData} from "rc-dock"
import "rc-dock/dist/rc-dock.css"
import {ApiServerUrlContext} from "./Common";
import {useInterval, useIntervalImmediate} from "./Utils"
import axios from "axios";
import {stringify} from "querystring";
import {dockRef} from "./App";

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

  function AlignedLabel(prop: { tag: string, content: string }) {
    return <Row>
      <Col className={"text-start"}>{prop.tag}</Col>
      <Col className={"text-end"}>{prop.content}</Col>
    </Row>;
  }

  return <Button className={"bg-secondary w-100 p-2 mb-1"} style={{fontFamily: "Lucida Console"}}>
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
        let keyv = 14111;

        for (const key in sessions) {
          console.log(`${key} => ${sessions[key]}`);
          sessList.push(<SessionListArgument info={sessions[key]} key={key}/>);

          const keyget = () => keyv++;
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
          sessList.push(<SessionListArgument info={sessions[key]} key={keyget()}/>);
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

  return <div className={"p-2 overflow-auto vh-100"}>
    {`target url is ${prop.url}`}
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ultricies metus gravida, elementum diam at, ornare odio. Pellentesque hendrerit auctor tristique. Duis a nisl eget mi dapibus ullamcorper. Sed posuere diam at sagittis tincidunt. Integer aliquet, nisi ut feugiat cursus, lectus arcu blandit ante, malesuada vehicula ligula ligula at nunc. Phasellus pellentesque vitae urna id malesuada. Cras lobortis sollicitudin nibh, in hendrerit ligula consectetur pretium. Duis et eros aliquet, tincidunt sem et, tempus nibh. Phasellus placerat leo id libero vehicula, in dignissim ex congue. Cras efficitur non mauris in convallis.

    In mattis pretium tristique. Morbi consequat vestibulum consectetur. In bibendum vel elit non faucibus. Aenean volutpat gravida est, vel fermentum metus vehicula at. Pellentesque sit amet diam porta, vehicula nisl in, interdum turpis. Aliquam erat volutpat. Nam euismod, arcu ut faucibus ullamcorper, ligula odio sollicitudin sapien, et euismod elit est a magna. Fusce consequat nibh ac pretium mollis. In non tincidunt ex, sed placerat nunc. Nam pharetra accumsan ex, eu suscipit lacus volutpat quis. Nam at ex massa. Aenean ac lorem dui.

    Sed placerat lacinia risus. Maecenas lacinia magna nisi, vel lobortis quam egestas a. Sed condimentum efficitur convallis. Nam ac malesuada velit. Donec maximus nulla quis diam accumsan viverra. Morbi pretium felis nec ligula gravida sagittis. Pellentesque in porta tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas sapien ante, rutrum in iaculis vitae, luctus vitae libero. Vestibulum semper ante ligula, sed lacinia nisi egestas et. Donec sollicitudin, nulla in finibus malesuada, ipsum lectus vestibulum dui, a iaculis neque lacus a sapien. Vivamus ante sem, posuere interdum quam sit amet, hendrerit interdum purus. Etiam erat nulla, bibendum eget finibus in, consectetur sed ipsum. Curabitur gravida felis sed cursus tempor. Praesent purus mauris, posuere vel gravida quis, eleifend vitae lacus. Nunc non varius arcu, nec accumsan mauris.

    Curabitur eget efficitur dolor. Sed justo lacus, sodales non scelerisque in, pellentesque quis leo. Cras blandit lacus eget metus tincidunt, vel tristique massa cursus. Curabitur maximus orci eu tortor rutrum, ultrices egestas dui ullamcorper. Quisque pharetra massa vel arcu efficitur laoreet. Aenean suscipit elit vel augue tincidunt, ut ultrices enim scelerisque. Etiam eleifend interdum dui quis faucibus. Etiam sit amet vulputate leo. In suscipit at ex vitae rhoncus.

    Phasellus mollis aliquet rutrum. Pellentesque bibendum sagittis enim. Nullam porttitor urna ac ipsum lacinia rutrum. Curabitur volutpat hendrerit purus eget tempus. Quisque at pulvinar libero. Vestibulum sit amet ex lorem. Pellentesque aliquam urna vel ultricies laoreet. Phasellus congue sodales nisl, a blandit ante tempor eu. Nam quis finibus diam. Duis commodo ex diam, at cursus nibh cursus eu. Aliquam lacinia nisl luctus lorem molestie dignissim.


    <Container>
      {sessionList === [] ? "no sessions available" : sessionList}
    </Container>
  </div>
}
