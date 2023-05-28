import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import LoadinBox from '../components/LoadinBox';
import { Store } from '../Store';
import { getError } from '../utilis';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { Button } from "react-bootstrap";


function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false };
        case 'DELIVER_REQUEST':
            return { ...state, loadingDeliver: true };
        case 'DELIVER_SUCCESS':
            return { ...state, loadingDeliver: false, successDeliver: true };
        case 'DELIVER_FAIL':
            return { ...state, loadingDeliver: false };
        case 'DELIVER_RESET':
            return {
                ...state,
                loadingDeliver: false,
                successDeliver: false,
            };


        default:
            return state;
    }
}

export default function OrderScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;

    const params = useParams();
    const { id: orderId } = params;
    const navigate = useNavigate();

    const [{ loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver }, dispatch] =
        useReducer(reducer, {
            loading: true,
            order: {},
            error: '',
            successPay: false,
            loadingPay: false,
        });

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
    function createOrder(data, actions) {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: { value: order.totalPrice },
                    },
                ],
            })
            .then((orderID) => {
                return orderID;
            });
    }
    function onApprove(data, actions) {
        return actions.order.capture().then(async function (details) {
            try {
                dispatch({ type: 'PAY_REQUEST' });
                const { data } = await axios.put(
                    `/api/orders/${order._id}/pay`,
                    details,
                    {
                        headers: { authorization: `Bearer ${userInfo.token}` },
                    }
                );
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                toast.success("התשלום התקבל בהצלחה");
                window.Email.send({
                    Host: "smtp.elasticemail.com",
                    Username: `${process.env.REACT_APP_MAIL_USERNAME}`,
                    Password: `${process.env.REACT_APP_MAIL_PASSWORD}`,
                    To: `${userInfo.email}`,
                    From: `${process.env.REACT_APP_MAIL_USERNAME}`,
                    Subject: `New order ${order._id}`,
                    Body: `<h1>Thanks for shopping with us</h1>
                    <p>
                    Hi ${order.shippingAddress.fullName},</p>
                    <p>We have finished processing your order.</p>
                    <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
                    <table>
                    <thead>
                    <tr>
                    <td><strong>Product</strong></td>
                    <td><strong>Quantity</strong></td>
                    <td><strong align="right">Price</strong></td>
                    </thead>
                    <tbody>
                    ${order.orderItems
                            .map(
                                (item) => `
                      <tr>
                      <td>${item.name}</td>
                      <td align="center">${item.quantity}</td>
                      <td align="right"> $${item.price.toFixed(2)}</td>
                      </tr>
                    `
                            )
                            .join('\n')}
                    </tbody>
                    <tfoot>
                    <tr>
                    <td colspan="2">Items Price:</td>
                    <td align="right"> $${order.itemsPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                    <td colspan="2">Shipping Price:</td>
                    <td align="right"> $${order.shippingPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                    <td colspan="2"><strong>Total Price:</strong></td>
                    <td align="right"><strong> $${order.totalPrice.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                    <td colspan="2">Payment Method:</td>
                    <td align="right">${order.paymentMethod}</td>
                    </tr>
                    </table>
                    <h2>Shipping address</h2>
                    <p>
                    ${order.shippingAddress.fullName},<br/>
                    ${order.shippingAddress.address},<br/>
                    ${order.shippingAddress.city},<br/>
                    ${order.shippingAddress.country},<br/>
                    ${order.shippingAddress.postalCode}<br/>
                    </p>
                    <hr/>
                    <p>
                    Thanks for shopping with us.
                    </p>
                    `
                });
            } catch (err) {
                dispatch({ type: 'PAY_FAIL', payload: getError(err) });
                toast.error(getError(err));
            }
        });
    }
    function onError(err) {
        toast.error(getError(err));
    }

    async function deliverOrderHandler() {
        try {
            dispatch({ type: 'DELIVER_REQUEST' });
            const { data } = await axios.put(
                `/api/orders/${order._id}/deliver`,
                {},
                {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({ type: 'DELIVER_SUCCESS', payload: data });

            window.Email.send({
                Host: "smtp.elasticemail.com",
                Username: `${process.env.REACT_APP_MAIL_USERNAME}`,
                Password: `${process.env.REACT_APP_MAIL_PASSWORD}`,
                To: `${data.data.email}`,
                From: `${process.env.REACT_APP_MAIL_USERNAME}`,
                Subject: `Your order is on the way`,
                Body: `
            <div style="text-align:left;">
            <h1>ההזמנה שלך בדרך</h1>
            <p>
            היי ${order.shippingAddress.fullName}, </p>
            <p>הזמנתך נשלחה לכתובת המבוקשת.</p>
            <p>החבילה אמורה להגיע ב-14 הימים הקרובים לתיבת הדואר או לסניף הדואר שלך</p>
            <h2>כתובת למשלוח</h2>
            <p>
           ,${order.shippingAddress.fullName}<br/>
            ,${order.shippingAddress.address}<br/>
            ,${order.shippingAddress.city}<br/>
            ,${order.shippingAddress.country}<br/>
           ,${order.shippingAddress.postalCode}<br/>
            </p>
            <h2>[הזמנה ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
            <table>
            <thead>
            <tr>
            <td><strong>מוצר</strong></td>
            <td><strong>כמות</strong></td>
            <td><strong align="right">Price</strong></td>
            </thead>
            <tbody>
            ${order.orderItems
                        .map(
                            (item) => `
              <tr>
              <td>${item.name}</td>
              <td align="center">${item.quantity}</td>
              <td align="right"> $${item.price.toFixed(2)}</td>
              </tr>
            `
                        )
                        .join('\n')}
            </tbody>
            <tfoot>
            <tr>
            <td colspan="2">Items Price:</td>
            <td align="right"> $${order.itemsPrice.toFixed(2)}</td>
            </tr>
            <tr>
            <td colspan="2">Shipping Price:</td>
            <td align="right"> $${order.shippingPrice.toFixed(2)}</td>
            </tr>
            <tr>
            <td colspan="2"><strong>Total Price:</strong></td>
            <td align="right"><strong> $${order.totalPrice.toFixed(2)}</strong></td>
            </tr>
            <tr>
            <td colspan="2">Payment Method:</td>
            <td align="right">${order.paymentMethod}</td>
            </tr>
            </table>
            <hr/>
            <p>
            Thanks for shopping with us.
            </p>
            `});

            toast.success("ההזמנה נמסרת לשליחה");
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'DELIVER_FAIL' });
        }
    }





    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/orders/${orderId}`, {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
            }
        };

        if (!userInfo) {
            return navigate('/signin');
        }
        if (!order._id || successPay || successDeliver || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                dispatch({ type: 'PAY_RESET' });
            }
            if (successDeliver) {
                dispatch({ type: 'DELIVER_RESET' });
            }
        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'client-id': clientId,
                        currency: 'ILS',
                    },
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            };
            loadPaypalScript();
        }
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay, successDeliver]);

    return loading ? (
        <LoadinBox />
    ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
    ) : (
        <div>
            <Helmet>
                <title>מספר הזמנה:{orderId}</title>
            </Helmet>
            <h1 className="my-3">מספר הזמנה: {orderId}</h1>
            <Row>
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>משלוח</Card.Title>
                            <Card.Text>
                                <strong>שם:</strong> {order.shippingAddress.fullName} <br />
                                <strong>כתובת: </strong> {order.shippingAddress.address},
                                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                ,{order.shippingAddress.country}
                            </Card.Text>
                            {order.isDelivered ? (
                                <MessageBox variant="success">                                    
                                    נשלח ב <br></br>{order.deliveredAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant="danger">לא נשלח</MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>תשלום</Card.Title>
                            <Card.Text>
                                <strong>באמצעות:</strong> {order.paymentMethod}
                            </Card.Text>
                            {order.isPaid ? (
                                <MessageBox variant="success">
                                    שולם בתאריך <br></br>{order.paidAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant="danger">לא שולם</MessageBox>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>פריטים</Card.Title>
                            <ListGroup variant="flush">
                                {order.orderItems.map((item) => (
                                    <ListGroup.Item key={item._id}>
                                        <Row className="align-items-center">
                                            <Col md={6}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="img-fluid rounded img-thumbnail"
                                                ></img>{' '}
                                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                            </Col>
                                            <Col md={3}>
                                                <span>{item.quantity}</span>
                                            </Col>
                                            <Col md={3}>₪{item.price}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>סיכום הזמנה
                            </Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Row>
                                        <Col>פריטים</Col>
                                        <Col>₪{order.itemsPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>משלוח</Col>
                                        <Col>₪{order.shippingPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>מיסים</Col>
                                        <Col>₪{order.taxPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>
                                            <strong>סך כל ההזמנה
                                            </strong>
                                        </Col>
                                        <Col>
                                            <strong>₪{order.totalPrice.toFixed(2)}</strong>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                                {!userInfo.isAdmin && !order.isPaid && (
                                    <ListGroup.Item>
                                        {isPending ? (
                                            <LoadinBox />
                                        ) : (
                                            <div>
                                                <PayPalButtons
                                                    createOrder={createOrder}
                                                    onApprove={onApprove}
                                                    onError={onError}
                                                ></PayPalButtons>
                                            </div>
                                        )}
                                        {loadingPay && <LoadinBox />}
                                    </ListGroup.Item>
                                )}
                                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadinBox/>}
                                        <div className="d-grid">
                                            <Button type="button" onClick={deliverOrderHandler}>
                                                שלח הזמנה
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
