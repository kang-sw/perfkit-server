import "bootstrap/dist/css/bootstrap.min.css"
import { Button, InputGroup, Container, Row, Col, FormControl, Form, FormGroup } from "react-bootstrap"
import { FormEvent, useState } from "react"

interface LoginProps {
    setUrl: (url: string) => void;
    setToken: (url: string) => void;
}

function Login(prop: LoginProps) {
    let [url, setUrl] = useState("");
    
    return <Form>
        <Form.Group className="m-3" controlId="formGetUrl">
            <Form.Label>{url}</Form.Label>
            <Form.Control 
                type="url" 
                placeholder="Enter URL"
                onChange={(e)=>{setUrl(e.target.value)}}
                value={url}/>
        </Form.Group>

        <Form.Group className="m-3" controlId="formGetID">
            <Form.Label>ID</Form.Label>
            <Form.Control name="id" type="id" placeholder="ID"></Form.Control>
        </Form.Group>

        <Form.Group className="m-3" controlId="formGetPW">
            <Form.Label>Password</Form.Label>
            <Form.Control name="pw" type="password" placeholder="Password"></Form.Control>
        </Form.Group>

        <div className="d-grid">
            <Button className="m-3" variant="primary" type="submit">
                Submit
            </Button>
        </div>
    </Form>
}

export default Login
