import React, {useRef, useState} from "react";
import {useInterval} from "./Utils";
import {ApiUrlSessionIdContext, axiosInstance} from "./Common";
import {XTerm} from "xterm-for-react";
import {FitAddon} from 'xterm-addon-fit'
import {Terminal} from "xterm";
import {write} from "fs";

interface ShellPacket {
  content: string,
  offset: number,
  sequence: number
}

function SessionTerminal(prop: { url: string, sessionKey: string, sessionDead: any }) {
  const terminal = useRef<XTerm>(null);
  const fitter = useRef<FitAddon>(new FitAddon());
  const [charFence, setCharFence] = useState(0);
  const [errorCounter, setErrorCounter] = useState(0);

  useInterval(() => {
    axiosInstance
      .get(
        prop.url + `/shell/${prop.sessionKey}/${charFence}`)
      .then(function (fetched) {
        const data: ShellPacket = fetched.data;
        setCharFence(data.sequence)

        terminal.current?.terminal.write(data.content);
        setErrorCounter(0);
      })
      .catch(function (err) {
        console.log(err);
        if (errorCounter >= 10)
          prop.sessionDead(prop.sessionKey);

        setErrorCounter(cnt => cnt + 1);
      });
    fitter.current.fit();
  }, 1000 / 10)

  const [shellInput, setShellInput] = useState("");

  async function onKeyPress(e: any) {
    const keyName: string = e.key;
    if (keyName != 'Enter' && keyName != 'Tab')
      return;

    e.preventDefault();
    const isInvoke = keyName == 'Enter';
    const input = shellInput;

    if (isInvoke)
      setShellInput("");

    try {
      const fetched = await axiosInstance.post(
        prop.url + `/shell/${prop.sessionKey}`,
        JSON.stringify({
          is_invoke: isInvoke,
          content: input
        }));

      if (isInvoke)
        return; // don't wait for reply

      console.log(fetched.data);
      const data: any = fetched.data;
      setShellInput(data['suggestion']);

      const term = terminal.current?.terminal as Terminal;
      const cols = term.cols;
      const candidates: Array<string> = data['candidates'];

      const maxCandLen = candidates
        .map((e) => e.length)
        .reduce((a, b) => Math.max(a, b));

      let alignment = maxCandLen + 6;
      alignment < 20 && (alignment = 20);

      term.write(`\r$ ${shellInput}`);
      term.write("\r\n");
      let column = 0;
      for (const idx in candidates) {
        const candidate = candidates[idx];
        if (column > 0 && column + candidate.length >= cols) {
          term.write("\r\n");
          column = 0;
        }

        term.write(candidate);
        column += candidate.length;

        while (column < cols && ++column % alignment != 0)
          term.write(' ');
      }
      term.write('\r\n\n');
    } catch (e) {
      console.error(e);
    }
  }

  return <div>
    <XTerm
      ref={terminal}
      addons={[fitter.current]}
      options={{fontFamily: "Cascadia Mono", fontSize: 18, fontWeight: "normal"}}/>
    <input
      style={{
        width: "100%",
        backgroundColor: "black",
        color: "white",
        fontFamily: "Cascadia Mono"
      }}
      placeholder={"$"}
      value={shellInput}
      onChange={(e) => setShellInput(e.target.value)}
      onKeyDown={(e) => (onKeyPress(e))}
    />
  </div>;
}

export function SessionDashboard() {
  return <ApiUrlSessionIdContext.Consumer>
    {(prop) => (
      <div style={{display: "grid", gridTemplateRows: "35px"}}>
        <h5 style={{gridRow: 1}}>| Terminal</h5>
        <SessionTerminal url={prop.url} sessionKey={prop.sessionKey} sessionDead={prop.notifySessionDie}/>
      </div>
    )}
  </ApiUrlSessionIdContext.Consumer>
}