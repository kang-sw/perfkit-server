import "bootstrap/dist/css/bootstrap.min.css"

import {axiosInstance} from "./Common";
import {useEffect, useRef, useState} from "react";
import {useIntervalImmediate, useIntervalState, useIntervalStateImmediate} from "./Utils";
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
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  console.log("config rerender")

  useIntervalImmediate(
    function PeriodicConfigFetch() {
      axiosInstance.get(`/config/update/${prop.sessionKey}/${fetchFence.current}`)
        .then(fetched => {
          const data: ConfigFetchResult = fetched.data;

          fetchFence.current = data.fence;
          let bShouldRedraw = false;

          // apply newly registered registries.
          if (data.registry_new != null) {
            bShouldRedraw = true;
            data.registry_new.forEach(data => {
              registries.current.push(data);

              // each entities will be assigned in separate table
              data.entities.forEach(entity => {
                dataMapping.current[entity.hash] = entity;
              })
            })
          }

          // apply updates. those are holding reference of
          if (data.updates != null) {
            bShouldRedraw = true;
            data.updates.forEach(data => {
              dataMapping.current[data[0]].value = data[1];
            })
          }

          if (bShouldRedraw)
            setRedrawTrigger(v => v + 1);
        })
        .catch(error => {
          // error handling will be done in terminal, thus only logging in this secition.
          console.error(error);
        });
    }, 500);

  const widgets = registries.current.map(({name, entities}) => {
    return <ConfigCategory key={name} name={name} entities={entities}/>
  })

  return <div style={{padding: 0}}>{widgets}</div>
}


function ConfigCategory(prop: { name: string, entities: Array<ConfigData> }) {
  const [folded, setFolded] = useState(true);
  const buttonColor = folded ? "lightgray" : "lightgreen";
  const [root, setRoot] = useState<CategoryNode>({name: "__root__", children: [], parent: null});

  useEffect(
    function ConstructTree() {
      setRoot(root => {
        RecursiveConfigTreeBuilder(prop.entities, {current: 0}, [], root);
        return root;
      });
      console.log(`Built Config Category Tree Data for {${prop.name}}`)
    }, []);

  return <Container style={{maxWidth: "100%", padding: 0, overflow: "auto", maxHeight: "100%"}}>
    <Row as={"button"}
         style={{width: "100%", margin: 0, backgroundColor: buttonColor}}
         onClick={() => setFolded(value => !value)}>
      {prop.name}
    </Row>
    <Row style={{margin: 0}}>
      {folded ? "" : <ConfigCategorySubContents nodeIterator={root}/>}
    </Row>
  </Container>
}

interface CategoryNode {
  name: string,
  parent: CategoryNode | null
  children: Array<ConfigData | CategoryNode>
}

function ConfigCategorySubContents(prop: { nodeIterator: CategoryNode }) {
  const [widgets, setWidgets] = useState([]);

  useEffect(
    function Construct() {

    }, []);

  return <div>hello!</div>
}

function ArrayEquals(a: Array<any>, b: Array<any>) {
  return a.length === b.length
    && a.every((elem, index) => elem === b[index]);
}

function ArrayContains(superset: Array<any>, subset: Array<any>) {
  return superset.length <= subset.length
    && superset.every((e, i) => e === subset[i]);
}

function RecursiveConfigTreeBuilder(
  entities: Array<ConfigData>,
  index: { current: number },
  currentHierarchy: Array<string>,
  node: CategoryNode
) {
  while (index.current < entities.length) {
    const entity = entities[index.current];
    const hierarchy = entity.hierarchical_name.split('|');

    const name = hierarchy[hierarchy.length - 1];
    const entityParentHierarchy = hierarchy.slice(0, hierarchy.length - 1);

    if (ArrayEquals(currentHierarchy, entityParentHierarchy)) {
      // if parent hierarchy is identical with delivered parent hierarchy, keep pushing element
      node.children.push(entity);
      ++index.current;
      continue;
    }

    // otherwise
    // if new hierarchy is subset of current parent, recursively get into it.
    if (ArrayContains(currentHierarchy, entityParentHierarchy)) {
      const newNode: CategoryNode =
        {
          name: entityParentHierarchy[entityParentHierarchy.length - 1],
          parent: node,
          children: []
        };
      node.children.push(newNode);

      RecursiveConfigTreeBuilder(
        entities,
        index,
        entityParentHierarchy,
        newNode
      );
      continue;
    }

    // otherwise, push new node to node's parent, that new node to be sibling of this.
    // which simply changes nothing, but mandate construction to parent
    return
  }
}
