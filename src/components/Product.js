import React from 'react'
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Product = (props) => {
  const { product } = props;


  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {

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

  return (
    <Card>

      <Link to={`/product/${product.slug}`} className="prod-img">
        <img src={product.image} alt="" className="card-img-top" />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>
            {product.name}
          </Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          {product.price} ₪
        </Card.Text>

        
        {product.countInStock === 0 ? (
                    <Button variant="light" disabled>
                        Out Of Stock
                    </Button>
                ) : (
                    <Button onClick={() => addToCartHandler(product)}>הוסף לסל</Button>)}
             
      </Card.Body>

    </Card>

  )
}

export default Product