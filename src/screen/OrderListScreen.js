import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import { getError } from '../utilis';
import axios from 'axios';
import LoadinBox from '../components/LoadinBox';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                orders: action.payload,
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




const OrderListScreen = () => {

    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, orders, loadingDelete, successDelete  }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

    const deleteHandler = async (order) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את ההזמנה?')) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                await axios.delete(`/api/orders/${order._id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success("ההזמנה נמחקה בהצלחה");
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (err) {
                toast.error(getError(error));
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
                const { data } = await axios.get(`/api/orders`, {
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
                <title>רשימת ההזמנות</title>
            </Helmet>
            <h1>רשימת ההזמנות</h1>
            {loadingDelete && <LoadinBox/>}

            {loading ? (
                <LoadinBox></LoadinBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>מזהה</th>
                            <th>משתמש</th>
                            <th>תאריך</th>
                            <th>סך הכל</th>
                            <th>שולם</th>
                            <th>נשלח</th>
                            <th>פעולה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.shippingAddress ? order.shippingAddress.fullName : 'משתמש מחוק'}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>{order.totalPrice.toFixed(2)}</td>
                                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'לא'}</td>
                                <td>
                                    {order.isDelivered
                                        ? order.deliveredAt.substring(0, 10)
                                        : 'לא'}
                                </td>
                                <td>
                                    <Button
                                        type="button"
                                        variant="light"
                                        onClick={() => {
                                            navigate(`/order/${order._id}`);
                                        }}
                                    >
                                        פרטים
                                    </Button>
                                    &nbsp;
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => deleteHandler(order)}
                                    >
                                        מחיקה
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

export default OrderListScreen