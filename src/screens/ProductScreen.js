import axios from "axios";
import { useEffect, useReducer } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { useParams } from "react-router-dom";
import Rating from "../components/Rating";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { Helmet } from "react-helmet-async";
import MessageBox from "../components/MessageBox";
import LoadinBox from "../components/LoadinBox";
import { getError } from "../utilis";

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
                dispatch({ type: 'FETCH_FAIL', payload: getError (err) });
            }
        }
        fetchData();
    }, [slug]);

    return loading ? (
        <LoadinBox/>
    ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
        <div>
            <Row>
                <Col md={6}>
                    <img className="img-large card-img"
                        src={product.image}
                        alt={product.name}>
                    </img>
                </Col>
                <Col md={3}>
                    <ListGroup>
                        <ListGroup.Item>
                            <Helmet>
                                <title>{product.name}</title>
                            </Helmet>
                            <h1>{product.name}</h1>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating
                                rating={product.rating}
                                numReviews={product.numReviews}
                            ></Rating>
                        </ListGroup.Item>
                        <ListGroup.Item> מחיר : {product.price} ₪ </ListGroup.Item>
                        <ListGroup.Item>תיאור: {product.description}</ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Row>
                                        <Col>מחיר:</Col>
                                        <Col>{product.price} ₪</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>מצב:</Col>
                                        <Col>
                                            {product.countInStock > 0 ? (
                                                <Badge bg="success">זמין במלאי</Badge>
                                            ) : (
                                                <Badge bg="danger">אזל מהמלאי</Badge>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>

                                {product.countInStock > 0 && (
                                    <ListGroup.Item>
                                        <div className="d-grid">
                                            <Button variant="primary">Add To Cart</Button>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>

        </div >
    );
};

export default ProductScreen;