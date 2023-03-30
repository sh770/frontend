import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const SigninScreen = () => {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  return (
    <Container className="small-container">
      <Helmet>
        <title>התחברות</title>
      </Helmet>
      <h1 className="my-3">התחברות</h1>
      <Form>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>מייל</Form.Label>
          <Form.Control type="email" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>סיסמה</Form.Label>
          <Form.Control type="password" required />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">התחברות</Button>
        </div>
        <div className="mb-3">
        לקוח חדש ?{" "}
          <Link to={`/signup?redirect=${redirect}`}>צור חשבון</Link>
        </div>
      </Form>
    </Container>
  );
};

export default SigninScreen;
