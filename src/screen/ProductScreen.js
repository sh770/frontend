import React, { useContext, useReducer, useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Rating from "../components/Rating";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import LoadinBox from "../components/LoadinBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utilis.js";
import { Store } from '../Store.js';
import { toast } from "react-toastify";
import { FloatingLabel } from "react-bootstrap";
import Form  from "react-bootstrap/Form";


const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case "FETCH_REQUEST":
      console.log(state);
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      console.log(state, action.payload);
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      console.log(state, action.type, action.payload);
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const ProductScreen = () => {
  const [selectedImage, setSelectedImage] = useState('');
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');



  const params = useParams();
  const { slug } = params;
  const [{ loading, error, product, loadingCreateReview }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get(`/api/products/${slug}`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart , userInfo  } = state;
  console.log(cart)

  const addToCartHandler = async () => {

    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/product/${product._id}`);
    console.log(data)

    if (data.countInStock < quantity) {
      toast.info('המוצר אזל מהמלאי');
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });

  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) { toast.error('Please write a review and rating');  return; }
    try {
        const { data } = await axios.post(
            `/api/products/product/${product._id}/reviews`,
            { rating, comment, username: userInfo.username },
            { headers: { Authorization: `Bearer ${userInfo.token}` }, }
        );
        dispatch({ type: 'CREATE_SUCCESS' });

        toast.success("סקירה נשלחה בהצלחה");
        product.reviews.unshift(data.review);
        product.numReviews = data.numReviews;
        product.rating = data.rating;

        dispatch({ type: 'REFRESH_PRODUCT', payload: product });
        window.scrollTo({ behavior: 'smooth', top: reviewsRef.current.offsetTop, });
    } 
catch (err) { toast.error(getError(err));
dispatch({ type: 'CREATE_FAIL' }); }
};


  return loading ? (
    <LoadinBox />
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
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
            <ListGroup.Item>מחיר: ₪{product.price}</ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button className="thumbnail" type="button" variant="light" onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
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
                    <Col>₪{product.price}</Col>
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
                      <Button variant="primary" onClick={addToCartHandler}>הוסף לסל</Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
                <h2 ref={reviewsRef}>ביקורות</h2>
                <div className="mb-3">
                    {product.reviews.length === 0 && (
                        <MessageBox>אין עדיין ביקורות על מוצר זה</MessageBox>
                    )}
                </div>
                <ListGroup>
                    {product.reviews.map((review) => (
                        <ListGroup.Item key={review._id}>
                            <strong>{review.username}</strong>
                            <Rating rating={review.rating} caption=" "></Rating>
                            <p>{review.createdAt.substring(0, 10)}</p>
                            <p>{review.comment}</p>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <div className="my-3">
                    {userInfo ? (
                        <form onSubmit={submitHandler}>
                            <h2>כתוב ביקורת
</h2>
                            <Form.Group className="mb-3" controlId="rating">
                                <Form.Label>דירוג</Form.Label>
                                <Form.Select
                                    aria-label="Rating"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="">בחר...</option>
                                    <option value="1">1- עלוב</option>
                                    <option value="2">2- הוגן</option>
                                    <option value="3">3- טוב</option>
                                    <option value="4">4- טוב מאוד</option>
                                    <option value="5">5- מעולה</option>
                                </Form.Select>
                            </Form.Group>
                            <FloatingLabel
                                controlId="floatingTextarea"
                                label="הערות"
                                className="mb-3"
                            >
                                <Form.Control
                                    as="textarea"
                                    placeholder="השאירו תגובה כאן"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </FloatingLabel>

                            <div className="mb-3">
                                <Button disabled={loadingCreateReview} type="submit">
                                שלח ביקורת
                                </Button>
                                {loadingCreateReview && <LoadinBox></LoadinBox>}
                            </div>
                        </form>
                    ) : (
                        <MessageBox>
                            בבקשה{' '}
                            <Link to={`/signin?redirect=/product/${product.slug}`}>
                                תתחבר
                            </Link>{' '}
                            כדי לכתוב ביקורת
                        </MessageBox>
                    )}
                </div>
            </div>


    </div>
  );
};

export default ProductScreen;
