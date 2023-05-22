import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store';
import { getError } from '../utilis';
import axios from 'axios';
import MessageBox from '../components/MessageBox';
import LoadinBox from '../components/LoadinBox';
import { Helmet } from 'react-helmet-async';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                users: action.payload,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return {
                ...state,
                loadingDelete: false,
                successDelete: true,
            };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false };
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };


        default:
            return state;
    }
};


const UserListScreen = () => {
    const navigate = useNavigate();

    const { state } = useContext(Store);
    const { userInfo } = state;
// eslint-disable-next-line
    const [{ loading, error, users, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        });

    const deleteHandler = async (user) => {
        if (window.confirm("האם אתה בטוח שברצונך למחוק?")) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                await axios.delete(`/api/users/${user._id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success("המשתמש נמחק בהצלחה");
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (err) {
                toast.error(getError(err));
                dispatch({
                    type: 'DELETE_FAIL',
                });
            }
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/users`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete]);




    return (
        <div>
            <Helmet>
                <title>משתמשים</title>
            </Helmet>
            <h1>משתמשים</h1>
            {loading ? (
                <LoadinBox></LoadinBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>מזהה</th>
                            <th>שם משתמש</th>
                            <th>אימייל</th>
                            <th>האם מנהל?</th>
                            <th>פעולה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.isAdmin ? 'כן' : 'לא'}</td>
                                <td>
                                    <Button type="button" variant="primary" onClick={() => navigate(`/admin/user/${user._id}`)}>
                                        עריכה
                                    </Button>
                                    &nbsp;
                                    <Button type="button" variant="danger" onClick={() => deleteHandler(user)}>
                                        מחק
                                    </Button>

                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}

export default UserListScreen