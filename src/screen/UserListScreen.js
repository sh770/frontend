import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store';
import { getError } from '../utilis';
import axios from 'axios';
import MessageBox from '../components/MessageBox';
import LoadinBox from '../components/LoadinBox';
import { Helmet } from 'react-helmet-async';

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

        default:
            return state;
    }
};


const UserListScreen = () => {
    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, users }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

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
        fetchData();
    }, [userInfo]);


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
                            <th>ש משתמש</th>
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
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
       );

}

export default UserListScreen