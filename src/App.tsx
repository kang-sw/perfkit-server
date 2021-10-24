import "bootstrap/dist/css/bootstrap.min.css"
import React, {useEffect, useState} from "react"
import Login from "./Login"
import {ApiServerUrlContext} from "./Common";
import {SessionListPanel} from "./SessionListPanel";
import {SessionDashboard} from "./SessionDashboard";

function App() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [activeSession, setActiveSession] = useState("");
  const [activatedSessions, setActivatedSessions] = useState<{ [key: string]: any }>({});
  const [dashboardRender, setDashboardRender] = useState(<div>No Sessions Loaded</div>);

  useEffect(() => {
    if (activeSession.length == 0)
      return;

    console.log(`active session changed: ${activeSession}`);
    if (!(activeSession in activatedSessions)) {
      let cloned = activatedSessions;
      cloned[activeSession] =
        <div style={{margin: 5}}>
          <SessionDashboard url={url} sessionKey={activeSession}/>
        </div>
      setActivatedSessions(cloned)
      setDashboardRender(cloned[activeSession])
      console.log(`updating activated session ... ${JSON.stringify(cloned)}`);
    }
  }, [activeSession]);

  return url.length === 0 ? (
    <Login setUrl={setUrl} setToken={setToken}/>
  ) : (
    <ApiServerUrlContext.Provider value={url}>
      <div style={{display: "flex", height: "100vh"}}>
        <div style={{minWidth: 400, flex: "0 1 0", overflow: "auto", borderRight: "1px solid black"}}>
          <SessionListPanel url={url} onSelect={setActiveSession}/>
        </div>
        <div style={{flex: "1 1 0"}}>
        {dashboardRender}
        </div>
      </div>
    </ApiServerUrlContext.Provider>
  );
}

export default App;
