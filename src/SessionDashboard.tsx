import {ApiUrlSessionIdContext} from "./Common";
import {SessionTerminal} from "./SessionDashboard_Terminal";
import {Col, Container, Row} from "react-bootstrap";
import {SessionConfigPanel} from "./SessionDashboard_Config";


export function SessionDashboard() {
  return <ApiUrlSessionIdContext.Consumer>
    {(prop) => (
      <Container className={"vh-100 d-flex flex-column"}>
        <Row style={{height:"600px"}}>
          <Col style={{}}>
            <h5 style={{gridRow: 1}}>| Terminal</h5>
            <SessionTerminal url={prop.url} sessionKey={prop.sessionKey} sessionDead={prop.notifySessionDie}/>
          </Col>
        </Row>
        <Row className={"h-100 overflow-auto"}>
          <Col className={"overflow-auto h-100"}>
            <h5 style={{gridRow: 1}}>| Configurations</h5>
            <SessionConfigPanel sessionKey={prop.sessionKey}/>
          </Col>
          <Col style={{border: "1px solid black", margin: "11px", marginLeft: 0}}>
            <Row> R 1 </Row>
            <Row> R 2 </Row>
          </Col>
        </Row>
      </Container>
    )}
  </ApiUrlSessionIdContext.Consumer>;
}