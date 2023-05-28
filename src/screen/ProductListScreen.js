import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoadinBox from '../components/LoadinBox';
import MessageBox from '../components/MessageBox';
import { getError } from "../utilis.js";
import { Store } from '../Store';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };

        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return {
                ...state,
                loadingCreate: false,
            };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };

        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return {
                ...state,
                loadingDelete: false,
                successDelete: true,
            };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false };

        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };



        default:
            return state;
    }
};

export default function ProductListScreen() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;
    const { state } = useContext(Store);
    const { userInfo } = state;


    const [{ loading, error, products, pages, loadingCreate, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

    const createHandler = async () => {
        if (window.confirm('האם אתה בטוח שברצונך ליצור מוצר חדש?')) {
            try {
                dispatch({ type: 'CREATE_REQUEST' });
                const { data } = await axios.post(
                    '/api/products',
                    {},
                    { headers: { Authorization: `Bearer ${userInfo.token}` }, }
                );
                toast.success("המוצר נוצר בהצלחה");
                dispatch({ type: 'CREATE_SUCCESS' });
                navigate(`/admin/product/${data.product._id}`);
            } catch (err) {
                toast.error(getError(error));
                dispatch({ type: 'CREATE_FAIL', });
            }
        }
    };


    const deleteHandler = async (product) => {
        if (window.confirm("האם אתה בטוח שברצונך למחוק את המוצר?")) {
            try {
                await axios.delete(`/api/products/product/${product._id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success("המוצר נמחק בהצלחה");
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
                const { data } = await axios.get(`/api/products/admin?page=${page} `, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: "FETCH_FAIL", payload: getError(err) });
                // navigate("/signin");
            }

            if (successDelete) {
                dispatch({ type: 'DELETE_RESET' });
            } else {
                fetchData();
            }

        };
        fetchData();
    }, [page, userInfo, successDelete]);

    return (
        <div>
            <Row>
                <Col>
                    <h1>מוצרים</h1>
                </Col>
                <Col className="col text-end">
                    <div>
                        <Button type="button" onClick={createHandler}>
                            יצירת מוצר
                        </Button>
                    </div>

                </Col>
            </Row>

            {loadingCreate && <LoadinBox />}
            {loadingDelete && <LoadinBox />}

            {loading ? (
                <LoadinBox></LoadinBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>מזהה מוצר</th>
                                <th>שם מוצר</th>
                                <th>מחיר</th>
                                <th>קטגוריה</th>
                                <th>מותג</th>
                                <th>פעולה</th>

                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>
                                    <td><Button type="button" variant="light" onClick={() => navigate(`/admin/product/${product._id}`)}>עריכה</Button>
                                        &nbsp;
                                        <Button type="button" variant="danger" onClick={() => deleteHandler(product)}>מחק</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                                key={x + 1}
                                to={`/admin/products?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}