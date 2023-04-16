import React, { useEffect, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { getError } from '../utilis.js';
import { Store } from '../Store';
import axios from 'axios';
import { toast } from "react-toastify";



const SigninScreen = () => {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
        const { data } = await axios.post('/api/users/signin', {
            email,
            password,
        });
        ctxDispatch({ type: 'USER_SIGNIN', payload: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate(redirect || '/');
    } catch (err) {
        toast.error(getError(err));
    }
};

useEffect(() => {
  if (userInfo) {
    navigate(redirect)
  } 
}, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>התחברות</title>
      </Helmet>
      <h1 className="my-3">התחברות</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>מייל</Form.Label>
          <Form.Control type="email" required onChange={(e)=> setEmail(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>סיסמה</Form.Label>
          <Form.Control type="password" required onChange={(e)=> setPassword(e.target.value)}/>
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
