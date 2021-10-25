import {ApiUrlSessionIdContext} from "./Common";
import {SessionTerminal} from "./SessionDashboard_Terminal";
import {Col, Container, Row} from "react-bootstrap";
import {SessionConfigPanel} from "./SessionDashboard_Config";


export function SessionDashboard() {
  return <ApiUrlSessionIdContext.Consumer>
    {(prop) => (
      <Container style={{maxWidth:"100%"}}>
        <Row style={{}}>
          <h5 style={{gridRow: 1}}>| Terminal</h5>
          <SessionTerminal url={prop.url} sessionKey={prop.sessionKey} sessionDead={prop.notifySessionDie}/>
        </Row>
        <Row>
          <Col>
            <SessionConfigPanel/>
          </Col>
          <Col>
            Hello 2
          </Col>
        </Row>
      </Container>
    )}
  </ApiUrlSessionIdContext.Consumer>
}