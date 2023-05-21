import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utilis.js';

const SignupScreen = () => {
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    console.log(pathname, search)
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';
    console.log(redirect)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');



    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Password does not match');
            return;
        }

        try {
            const { data } = await axios.post('/api/users/signup', {
                firstName,
                lastName,
                username,
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

    return (
        <Container className="small-container">
            <Helmet>
                <title>רישום לאתר</title>
            </Helmet>

            <h1 className="my-3">רישום לאתר</h1>

            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>שם פרטי</Form.Label>
                    <Form.Control onChange={(e) => setFirstName(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>שם משפחה</Form.Label>
                    <Form.Control onChange={(e) => setLastName(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>שם משתמש</Form.Label>
                    <Form.Control onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>מייל</Form.Label>
                    <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>סיסמה</Form.Label>
                    <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} />

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>אימות סיסמה</Form.Label>
                        <Form.Control type="password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="form-check mb-3" controlId="agreeTerms">
                        <input
                            type="checkbox"
                            required
                            className="form-check-input"
                        />
                        <Form.Label className="form-check-label" Style="margin-right:30px">
                            על ידי לחיצה על הדברים הבאים
                            , אתה מקבל את <Link to={`/terms-of-service`}>תנאי השימוש באתר</Link>.
                        </Form.Label>
                    </Form.Group>

                </Form.Group>

                <div className="mb-3">
                    <Button type="submit">רישום</Button>
                </div>
                <div className="mb-3">
                    כבר רשום?{' '}
                    <Link to={`/signin?redirect=${redirect}`}>התחברות</Link>
                </div>
            </Form>

        </Container>
    )
}


export default SignupScreen