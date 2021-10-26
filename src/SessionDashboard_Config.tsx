import "bootstrap/dist/css/bootstrap.min.css"

import {axiosInstance} from "./Common";
import {useEffect, useRef, useState} from "react";
import {useIntervalImmediate} from "./Utils";
import {Badge, Button, Col, Container, Row} from "react-bootstrap";

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

  console.log(`config redraw: ${redrawTrigger}:${fetchFence.current}`)

  useEffect(() => {
    return () => {
      registries.current = [];
      dataMapping.current = {};
      fetchFence.current = 0;
    };
  }, [])

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

  return <div style={{padding: 0, fontFamily: "consolas"}}>{widgets}</div>
}


function ConfigCategory(prop: { name: string, entities: Array<ConfigData> }) {
  const [folded, setFolded] = useState(true);
  const [root, setRoot] = useState<CategoryNode>();

  useEffect(
    function ConstructTree() {
      setRoot(_unused => {
        const nodeRoot: CategoryNode = {name: "__root__", children: [], parent: null, folded: false};
        RecursiveConfigTreeBuilder(prop.entities, {current: 0}, [], nodeRoot);
        return nodeRoot;
      });
      console.log(`Built Config Category Tree Data for {${prop.name}}`)
    }, [prop.name, prop.entities]);

  const buttonColor = folded ? "secondary" : "success";
  return <Container
    style={{border: "1px solid black", maxWidth: "100%", padding: 0, overflow: "auto", maxHeight: "100%"}}>
    <Row style={{width: "100%", margin: 0}}
         onClick={() => setFolded(value => !value)}>
      <Button variant={buttonColor}><h6>{prop.name}</h6></Button>
    </Row>
    <Row style={{margin: 0}}>
      {folded ? "" : <ConfigCategorySubContents nodeIterator={root as CategoryNode}/>}
    </Row>
  </Container>
}

interface CategoryNode {
  name: string
  parent: CategoryNode | null
  folded: boolean
  children: Array<ConfigData | CategoryNode>
}

function IsDataEntity(entity: ConfigData | CategoryNode) {
  return 'hash' in entity;
}

function NodeDepth(entity: CategoryNode | null) {
  let depth = 0;

  while (entity != null) {
    entity = entity.parent;
    depth++;
  }

  return depth;
}

function ConfigCategorySubContents(prop: { nodeIterator: CategoryNode }) {
  const depth = NodeDepth(prop.nodeIterator);
  const [foldedState, setFoldedState] = useState(true);

  useEffect(() => {
    setFoldedState(prop.nodeIterator.folded);
  }, [prop.nodeIterator.folded]);

  console.log(`Constructing category widget {${prop.nodeIterator.name}} `)
  const widgets = (prop.nodeIterator.children.map(
    entityRaw => {
      if (IsDataEntity(entityRaw)) {
        const entity = entityRaw as ConfigData;
        return <ConfigEntityPanel key={entity.hash} data={entity}/>;
      } else {
        const entity = entityRaw as CategoryNode;
        return <ConfigCategorySubContents key={entity.name} nodeIterator={entity}/>
      }
    }
  ));

  const buttonColor = foldedState ? "info" : "primary";
  return <Row style={{margin: 0, padding: 0}}>
    {prop.nodeIterator.name === "__root__" ? ""
      : <Row style={{padding: 0, margin: 0, paddingLeft: (depth - 2) * 12}}>
        <Button style={{
          border: "1px solid black",
          padding: 0,
          paddingLeft: 8,
          paddingRight: 8,
          width: "100%",
          textAlign: "left"
        }}
                onClick={() => {
                  prop.nodeIterator.folded = !prop.nodeIterator.folded;
                  setFoldedState(prop.nodeIterator.folded);
                }}
                variant={buttonColor}>
          {prop.nodeIterator.name}
        </Button>
      </Row>
    }
    {foldedState ? "" :
      <Row style={{margin: 0, padding: 0, paddingLeft: (depth - 1) * 12}}>
        {widgets}
      </Row>
    }
  </Row>;
}


function ConfigEntityPanel(prop: { data: ConfigData }) {
  const entity = prop.data;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  useEffect(() => setEditValue(JSON.stringify(entity.value, null, 2)), [editing]);

  const sourceValueStr = JSON.stringify(entity.value, null, 2);
  let valueStr = sourceValueStr;
  if (valueStr.length > 25) {
    valueStr = valueStr.slice(0, 25);
    valueStr += "..."
  }

  return <Row style={{margin: 0, padding: 0}}>
    <Row style={{margin: 0, padding: 0, backgroundColor: editing ? "#ffee00" : "lightgray"}}
         as={"button"}
         onClick={() => setEditing(v => !v)}>
      <Col style={{textAlign: "left"}}>{ConfigName(entity)}</Col>
      <Col style={{textAlign: "right"}}>{valueStr}</Col>
    </Row>
    {!editing ? "" :
      <Row style={{
        border: "1px solid black",
        margin: 0,
        padding: 0,
        paddingLeft: 24,
        backgroundColor: "black",
        color: "white"
      }}
           onClick={(e: any) => e.preventDefault()}>
        <Row style={{padding: 0}}>
          <Col md="auto">[value]</Col>
          <Col style={{textAlign: "right", padding: 0}}>{sourceValueStr}</Col>
        </Row>
        <Row style={{padding: 0}}>
          <Col sm={1}/>
          <Col as={"p"}
               style={{textAlign: "left", padding: 0, whiteSpace: "pre", color: "#aaaaaa"}}>
            {JSON.stringify(entity.metadata, null, 2)}
          </Col>
        </Row>
        <Row style={{padding: 0}}>
          <Col md={"auto"} style={{}}>[set]</Col>
          <Col sm={1}/>
          <Col as={"textarea"}
               style={{padding: 0, backgroundColor: "#222222", color: "lightgreen"}}
               value={editValue}
               onChange={(e: any) => setEditValue(e.value)}/>
        </Row>
        <Row>
          <Button style={{margin: 8, padding: 0}}
                  variant={"warning"}>
            Commit
          </Button>
        </Row>
      </Row>
    }
  </Row>;
}

function ConfigName(data: ConfigData) {
  return data.hierarchical_name.split("|").at(-1);
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
          children: [],
          folded: false,
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
