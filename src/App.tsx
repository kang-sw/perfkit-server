import "bootstrap/dist/css/bootstrap.min.css"
import {Button, Container, Row, Col} from "react-bootstrap"
import React, {useState} from "react"
import DockLayout, {LayoutData} from "rc-dock"
import "rc-dock/dist/rc-dock.css"
import Login from "./Login"
import {ApiServerUrlContext} from "./Common";
import {SessionListPanel} from "./SessionListPanel";

const defaultLayout: LayoutData = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        id: 'left',
        tabs: [
          {
            cached: true, id: 'sessions',
            title: 'Active Sessions',
            content: <ApiServerUrlContext.Consumer>
              {value => <SessionListPanel url={value}/>}
            </ApiServerUrlContext.Consumer>
          },
          {
            id:'sampl0',
            title: 'sampl0',
            content: <div>sample 0</div>
          },
          {
            id:'sampl1',
            title: 'sampl1',
            content: <div>sample 0</div>
          }
        ]
      }
    ]
  }
}


export let dockRef: DockLayout;
function getDockRef(r: DockLayout) {
  dockRef = r;
}

function App() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  return url.length === 0 ? (
    <Login setUrl={setUrl} setToken={setToken}/>
  ) : (
    <ApiServerUrlContext.Provider value={url}>
      <DockLayout
        ref={getDockRef}
        defaultLayout={defaultLayout}
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          right: 10,
          bottom: 10,
          fontFamily: "Lucida Console"
        }}
      />
    </ApiServerUrlContext.Provider>
  );
}

export default App;
