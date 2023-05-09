import React, { useEffect, useReducer, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getError } from '../utilis';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import LoadinBox from '../components/LoadinBox';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import Product from '../components/Product';

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
                countProducts: action.payload.countProducts,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};

const prices = [
    {
        name: 'מ ₪50 עד ₪200',
        value: '50-200',
    },
    {
        name: 'מ ₪200 עד ₪1000',
        value: '200-1000',
    },
];

export const ratings = [
    {
        name: '4 כוכבים ומעלה',
        rating: 4,
    },

    {
        name: '3 כוכבים ומעלה',
        rating: 3,
    },

    {
        name: '2 כוכבים ומעלה',
        rating: 2,
    },

    {
        name: 'כוכב 1 ומעלה',
        rating: 1,
    },
];

export default function SearchScreen() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const category = sp.get('category') || 'all';
    const query = sp.get('query') || 'all';
    const price = sp.get('price') || 'all';
    const rating = sp.get('rating') || 'all';
    const order = sp.get('order') || 'lowest';
    const page = sp.get('page') || 1;

    const [{ loading, error, products, pages, countProducts }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(
                    `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
                );
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(error),
                });
            }
        };
        fetchData();
    }, [category, error, order, page, price, query, rating]);

    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`/api/products/categories`);
                setCategories(data);
            } catch (err) {
                toast.error(getError(err));
            }
        };
        fetchCategories();
    }, [dispatch]);

    const getFilterUrl = (filter) => {
        const filterPage = filter.page || page;
        const filterCategory = filter.category || category;
        const filterQuery = filter.query || query;
        const filterRating = filter.rating || rating;
        const filterPrice = filter.price || price;
        const sortOrder = filter.order || order;
        return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
    };

    return (
        <div>
            <Helmet>
                <title>חיפוש מוצרים</title>
            </Helmet>
            <Row>
                <Col md={12}>

                    {loading ? (
                        <LoadinBox></LoadinBox>
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <>
                            <Row className="justify-content-between mb-3" style={{ color: "white" }}>
                                <Col md={6}>
                                    <div>
                                        {countProducts === 0 ? 'אין' : countProducts} תוצאות
                                        {query !== 'all' && ' : ' + query}
                                        {category !== 'all' && ' : ' + category}
                                        {price !== 'all' && ' : Price ' + price}
                                        {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                                        &nbsp;
                                        {query !== 'all' ||
                                            category !== 'all' ||
                                            rating !== 'all' ||
                                            price !== 'all' ? (
                                            <Button
                                                variant="light"
                                                onClick={() => navigate('/search')}
                                            >
                                                <i className="fas fa-times-circle"></i>
                                            </Button>
                                        ) : null}
                                    </div>
                                </Col>
                                <Col className="text-end">
                                    מיין לפי{' '}
                                    <select
                                        value={order}
                                        onChange={(e) => {
                                            navigate(getFilterUrl({ order: e.target.value }));
                                        }}
                                    >
                                        <option value="newest">עדכונים אחרונים</option>
                                        <option value="lowest" defaultValue={"lowest"}>מחיר: מהנמוך לגבוה</option>
                                        <option value="highest">מחיר: מהגבוה לנמוך</option>
                                        <option value="toprated">ממוצע חוות דעת של לקוחות</option>
                                    </select>

                                    <br></br>
                                    <br></br>
                                    <div>
                                        <h3>טווח מחירים
                                        </h3>
                                        <ul>
                                            <ol>
                                                <Link
                                                    className={'all' === price ? 'text-bold' : ''}
                                                    to={getFilterUrl({ price: 'all' })}
                                                >
                                                    הכל
                                                </Link>
                                            </ol>
                                            {prices.map((p) => (
                                                <ol key={p.value}>
                                                    <Link
                                                        to={getFilterUrl({ price: p.value })}
                                                        className={p.value === price ? 'text-bold' : ''}
                                                    >
                                                        {p.name}
                                                    </Link>
                                                </ol>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className='d-grid'>
                                        <h4>מיין לפי ביקורות לקוחות</h4>
                                        <ul>
                                            {ratings.map((r) => (

                                                <ol key={r.name} >
                                                    <Link
                                                        to={getFilterUrl({ rating: r.rating })}
                                                        className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                                                    >
                                                        <Rating caption={' '} rating={r.rating}></Rating>
                                                    </Link>
                                                </ol>
                                            ))}
                                            <ol>
                                                <Link
                                                    to={getFilterUrl({ rating: 'all' })}
                                                    className={rating === 'all' ? 'text-bold' : ''}
                                                >
                                                    <Rating caption={' '} rating={0}></Rating>
                                                </Link>
                                            </ol>
                                        </ul>
                                    </div>
                                </Col>
                            </Row>

                            {products.length === 0 && (
                                <MessageBox>לא נמצא מוצר</MessageBox>
                            )}

                            <Row className="products-row">
                                {products.map((product) => (
                                    <Col sm={6} lg={3} className="mb-3" key={product._id}>
                                        <Product product={product}></Product>
                                    </Col>
                                ))}
                            </Row>

                            <div>
                                {[...Array(pages).keys()].map((x) => (
                                    <Link
                                        key={x + 1}
                                        className="mx-1"
                                        to={getFilterUrl({ page: x + 1 })}
                                    >
                                        <Button
                                            className={Number(page) === x + 1 ? 'text-bold' : ''}
                                            variant="light"
                                        >
                                            {x + 1}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </Col>
            </Row>
        </div >
    );
} 