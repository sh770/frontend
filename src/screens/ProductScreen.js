import axios from "axios";
import { useEffect, useReducer } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { useParams } from "react-router-dom";
import Rating from "../components/Rating";

const reducer = (state, action) => {

    switch (action.type) {

        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, product: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }

}

function ProductScreen() {
    const params = useParams();
    const { slug } = params;

    const [{ loading, error, product }, dispatch] = useReducer(reducer, {
        product: [],
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const result = await axios.get(`/api/products/${slug}`);
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
            }
            catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        }
        fetchData();
    }, [slug]);

    return loading ? (
        <div>Loading...</div>
    ) : error ? (
        <div>{error}</div>
    ) : (
        <div>
            <Row>
                <Col ms={2} md={4} lg={3} >
                    <img className="img-large card-img" src={product.image} alt={product.name}></img>
                </Col>
                <Col ms={2} md={4} lg={3} >
                    <ListGroup>
                        <ListGroup.Item>
                            <h1>{product.name}</h1>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating rating={product.rating} numReviews={product.numReviews}></Rating>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Price: {product.price} ₪
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Description: {product.description}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}></Col>
            </Row>
        </div>
    );
}

export default ProductScreen;
