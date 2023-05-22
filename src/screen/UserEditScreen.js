import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from "../Store";
import { getError } from "../utilis";
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Container } from 'react-bootstrap';
import LoadinBox from '../components/LoadinBox.js';
import MessageBox from '../components/MessageBox.js';
import { Helmet } from 'react-helmet-async';


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;
    }
};




const UserEditScreen = () => {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const params = useParams();
    const { id: userId } = params;
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(
                `/api/users/${userId}`,
                { _id: userId, username, firstName, lastName, email, isAdmin },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({
                type: 'UPDATE_SUCCESS',
            });
            toast.success("המשתמש עודכן בהצלחה");
            navigate('/admin/users');
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'UPDATE_FAIL' });
        }
    };

    const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                setUsername(data.username);
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setEmail(data.email);
                setIsAdmin(data.isAdmin);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
            
        };

        
        fetchData();
    }, [userId, userInfo]);


    return (
        <Container className="small-container">
            <Helmet>
                <title>עריכת משתמש ${userId}</title>
            </Helmet>
            <h1>עריכת משתמש {userId}</h1>

            {loading ? (
                <LoadinBox></LoadinBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>שם משתמש</Form.Label>
                        <Form.Control
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>שם</Form.Label>
                        <Form.Control
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>משפחה</Form.Label>
                        <Form.Control
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>אימייל</Form.Label>
                        <Form.Control
                            value={email}
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Check
                        className="mb-3"
                        type="checkbox"
                        id="isAdmin"
                        label="מנהל"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                    />

                    <div className="mb-3">
                        <Button disabled={loadingUpdate} type="submit">
                            שמירה
                        </Button>
                        {loadingUpdate && <LoadinBox></LoadinBox>}
                    </div>
                </Form>
            )}
        </Container>
    );


}

export default UserEditScreen