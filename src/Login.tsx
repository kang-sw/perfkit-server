import "bootstrap/dist/css/bootstrap.min.css"
import {Button, Form} from "react-bootstrap"
import { useState} from "react"

interface LoginProps {
    setUrl: (url: string) => void;
    setToken: (url: string) => void;
}

function Login(prop: LoginProps) {
    const [url, setUrl] = useState("http://");
    const onSubmit = (e: any) => {
        e.preventDefault();
        prop.setUrl(url);
    };

    return <Form onSubmit={onSubmit}>
        <Form.Group className="m-3" controlId="formGetUrl">
            <Form.Label>Enter API Server URL</Form.Label>
            <Form.Control
                type="url"
                placeholder="Enter URL"
                onChange={(e) => {
                    setUrl(e.target.value)
                }}
                value={url}/>
        </Form.Group>

        <Form.Group className="m-3" controlId="formGetID">
            <Form.Label>ID</Form.Label>
            <Form.Control name="id" type="id" placeholder="ID"/>
        </Form.Group>

        <Form.Group className="m-3" controlId="formGetPW">
            <Form.Label>Password</Form.Label>
            <Form.Control name="pw" type="password" placeholder="Password"/>
        </Form.Group>

        <div className="d-grid">
            <Button className="m-3" variant="primary" type="submit">
                Submit
            </Button>
        </div>
    </Form>
}

export default Login
