import "bootstrap/dist/css/bootstrap.min.css"
import React, {useCallback, useEffect, useState} from "react"
import Login from "./Login"
import {ApiServerUrlContext, ApiUrlSessionIdContext, axiosInstance, RefreshAxiosInstance} from "./Common";
import {SessionListPanel} from "./SessionListPanel";
import {SessionDashboard} from "./SessionDashboard";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [activeSession, setActiveSession] = useState("");
  const [dashboardRender, setDashboardRender] = useState(<div>No Sessions Loaded</div>);

  useEffect(
    () => {
      if (activeSession.length === 0)
        return;

      console.log(`active session changed: ${activeSession}`);
      setDashboardRender(
        <div style={{margin: 5}}>
          <SessionDashboard/>
        </div>
      );
    }, [activeSession]);

  const onSessionDead = useCallback(
    (sessionKey: string) => {
      if (sessionKey === activeSession)
        setActiveSession("");

      setDashboardRender(<div>Session Expired</div>);
    }, [activeSession]);

  function onSetUrl(newUrl: string) {
    setUrl(newUrl);
    RefreshAxiosInstance({
      baseURL: newUrl
      // todo: auth:
    })
  }

  return url.length === 0 ? (
    <Login setUrl={onSetUrl} setToken={setToken}/>
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
