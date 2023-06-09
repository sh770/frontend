import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import LoadinBox from '../components/LoadinBox';
import { getError } from '../utilis';

const reduser = (state, action) => {

    switch (action.type) {

        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;

    }
}




const HomeScreen = () => {

    const [{ loading, error, products }, dispatch] = useReducer(reduser, {
        products: [],
        loading: true,
        error: ''
    })
    console.log(products);
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const result = await axios.get('/api/products');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
                // console.log(reduser.data);
            }
            catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError (err) });
            }
        };

        fetchData();

    }, [])
    console.log(products);

    



    return (
        <div>
            <Helmet>
                <title>החנות בריאקט</title>
            </Helmet>
            <h1>מוצרים מומלצים</h1>
            <div className="products">
                <Row>
                    {
                        loading ? (
                            <LoadinBox/>
                        ) : error ? (
                            <MessageBox variant='danger'>{error}</MessageBox>
                        ) : (

                            products.map((prodact) => (
                                <Col key={Product.slag} ms={2} md={4} lg={3} className="mb-3" >
                                    <Product product={prodact}></Product>
                                </Col>
                            )))}
                </Row>
            </div>
        </div>
    )
};

export default HomeScreen