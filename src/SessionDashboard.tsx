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
  const history = useRef<Array<string>>([""]);
  const [historyCursor, setHistoryCursor] = useState(0);

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
    history.current[history.current.length - 1] = shellInput;

    // control history
    if (keyName == 'ArrowUp' || keyName == 'ArrowDown') {
      e.preventDefault();
      let next = historyCursor;
      if (keyName == 'ArrowUp')
        next += 1;
      else
        next -= 1;

      next = next < 0
        ? 0
        : next >= history.current.length
          ? history.current.length - 1
          : next;

      console.log(`next is ${next}, history is ${history.current}`)

      if (next != historyCursor) {
        setHistoryCursor(next);
        setShellInput(history.current[history.current.length - 1 - next]);
      }
      return;
    }

    if (keyName != 'Enter' && keyName != 'Tab')
      return;

    e.preventDefault();
    const isInvoke = keyName == 'Enter';
    const input = shellInput;

    if (isInvoke) {
      setShellInput("");
      setHistoryCursor(0);

      const bIsFirst = history.current.length < 2;
      const bDuplicated = !bIsFirst
        && (history.current[history.current.length - 1]
          == history.current[history.current.length - 2])
      const bNotEmpty = input.length > 0;
      if (bNotEmpty && !bDuplicated) {
        history.current.push(input);
        if (history.current.length > 50)
          history.current.shift();
      }
    }

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

      // if user pressed tab, replace current input string with output suggestion,
      //  and print the list of candidate words to console.
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
        backgroundColor: "#ccffcc",
        color: "black",
        fontFamily: "Cascadia Mono"
      }}
      placeholder={"$ enter command here"}
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