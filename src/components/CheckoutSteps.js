import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const CheckoutSteps = (props) => {
  return (
    <Row className="checkout-steps">
        <Col className={props.step1 ? 'active' : ''}>להתחבר</Col>
        <Col className={props.step2 ? 'active' : ''}>משלוח</Col>
        <Col className={props.step3 ? 'active' : ''}>תשלום</Col>
        <Col className={props.step4 ? 'active' : ''}>בצע הזמנה</Col>
    </Row>
  );

}

export default CheckoutSteps