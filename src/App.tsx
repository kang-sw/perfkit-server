import "bootstrap/dist/css/bootstrap.min.css"
import React, {useCallback, useEffect, useState} from "react"
import Login from "./Login"
import {ApiServerUrlContext, ApiUrlSessionIdContext} from "./Common";
import {SessionListPanel} from "./SessionListPanel";
import {SessionDashboard} from "./SessionDashboard";

function App() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [activeSession, setActiveSession] = useState("");
  const [aliveSessions, setAliveSessions] = useState<{ [key: string]: any }>({});
  const [dashboardRender, setDashboardRender] = useState(<div>No Sessions Loaded</div>);

  useEffect(() => {
    if (activeSession.length == 0)
      return;

    console.log(`active session changed: ${activeSession}`);
    if (!(activeSession in aliveSessions)) {
      let cloned = aliveSessions;
      cloned[activeSession] =
        <div style={{margin: 5}}>
          <SessionDashboard/>
        </div>
      setAliveSessions(cloned)
      setDashboardRender(cloned[activeSession])
      console.log(`updating activated session ... ${JSON.stringify(cloned)}`);
    }
  }, [activeSession]);

  const onSessionDead = useCallback(
    (sessionKey: string) => {
      if (sessionKey == activeSession)
        setActiveSession("");

      setAliveSessions((value) => {
        delete value[sessionKey];
        return value;
      })

      setDashboardRender(<div>Session Expired</div>);
    }, [activeSession, aliveSessions]);

  return url.length === 0 ? (
    <Login setUrl={setUrl} setToken={setToken}/>
  ) : (
    <ApiServerUrlContext.Provider value={url}>
      <ApiUrlSessionIdContext.Provider
        value={{
          url: url,
          sessionKey: activeSession,
          notifySessionDie: onSessionDead
        }}>

        <div style={{display: "flex", height: "100vh"}}>
          <div style={{minWidth: 400, flex: "0 1 0", overflow: "auto", borderRight: "1px solid black"}}>
            <SessionListPanel url={url} onSelect={setActiveSession}/>
          </div>
          <div style={{flex: "1 1 0"}}>
            {dashboardRender}
          </div>
        </div>

      </ApiUrlSessionIdContext.Provider>
    </ApiServerUrlContext.Provider>
  )
    ;
}

export default App;
