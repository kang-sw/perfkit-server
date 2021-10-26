import "bootstrap/dist/css/bootstrap.min.css"

import {axiosInstance} from "./Common";
import {useEffect, useRef, useState} from "react";
import {useInterval, useIntervalImmediate} from "./Utils";
import {Container, Row} from "react-bootstrap";

interface ConfigData {
  hash: number,
  order_key: string,
  hierarchical_name: string,
  value: any,
  metadata: any
}

interface ConfigFetchResult {
  fence: number,
  registry_new: Array<{ name: string, entities: Array<ConfigData> }>;
  updates: Array<[number, any]>
}

type ConfigDataMapping = { [key: number]: ConfigData }

export function SessionConfigPanel(prop: { sessionKey: string }) {
  const fetchFence = useRef(0);
  const dataMapping = useRef<ConfigDataMapping>({});
  const registries = useRef<Array<{ name: string, entities: Array<ConfigData> }>>([]);

  useIntervalImmediate(
    function PeriodicConfigFetch() {
      axiosInstance.get(`/config/update/${prop.sessionKey}/${fetchFence.current}`)
        .then(fetched => {
          const data: ConfigFetchResult = fetched.data;
          console.log(data)

          fetchFence.current = data.fence;

          // apply newly registered registries.
          if (data.registry_new != null)
            data.registry_new.forEach(data => {
              registries.current.push(data);

              // each entities will be assigned in separate table
              data.entities.forEach(entity => {
                dataMapping.current[entity.hash] = entity;
              })
            })

          // apply updates. those are holding reference of
          if (data.updates != null)
            data.updates.forEach(data => {
              dataMapping.current[data[0]].value = data[1];
            })
        })
        .catch(error => {
          // error handling will be done in terminal, thus only logging in this secition.
          console.error(error);
        });
    }, 500);

  const widgets = registries.current.map(({name, entities}) => {
    return <ConfigCategory key={name} name={name} entities={entities}/>
  })

  return <div>{widgets}</div>
}


function ConfigCategory(prop: { name: string, entities: Array<ConfigData> }) {
  return <Container>
    <Row>
      {prop.name}
    </Row>
    <Row>
      {JSON.stringify(prop.entities)}
    </Row>
  </Container>
}
