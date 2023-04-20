import 'react-devtools'
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomeScreen from './screen/HomeScreen';
import ProductScreen from './screen/ProductScreen';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext } from 'react';
import { Store } from './Store';
import { Badge, Nav, NavDropdown } from 'react-bootstrap';
import CartScreen from './screen/CartScreen';
import SigninScreen from './screen/SigninScreen';
import { ToastContainer } from 'react-toastify';
import ShippingAddressScreen from './screen/ShippingAddressScreen.js';
import SignupScreen from './components/SignupScreen';
import PaymentMethodScreen from "./screen/PaymentMethodScreen";
import PlaceOrderScreen from "./screen/PlaceOrderScreen";


function App() {

const { state, dispatch: ctxDispatch } = useContext(Store);
const { cart, userInfo } = state;

const signoutHandler = () => {
  ctxDispatch({ type: 'USER_SIGNOUT' });
  localStorage.removeItem('userInfo');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  localStorage.removeItem('cartItems');
  window.location.href = '/signin';
};

  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
      <ToastContainer position="top-center" limit={1} />
        <header >
          <Navbar bg="dark" variant="dark">
            <Container>
              <LinkContainer to="/">
                <Navbar.Brand>החנות בריאקט</Navbar.Brand>
              </LinkContainer>
              <Nav className='me-auto'>
                <Link to='/cart' className='nav-link'>
                  סל הקניות:
                  {cart.cartItems.length > 0 && (
                    <Badge pill='danger'>
                      {cart.cartItems.reduce((a,c) => a + c.quantity, 0)}
                    </Badge>
                  )}
                </Link>
                {userInfo ? (
                  <NavDropdown title={userInfo?.username} id="basic-nav-dropdown">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>פרופיל משתמש</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/orderhistory">
                      <NavDropdown.Item>הסטוריית קניות</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <Link
                      className="dropdown-item"
                      to="#signout"
                      onClick={signoutHandler}
                    >
                      התנתק
                    </Link>
                  </NavDropdown>
                ) : (
                  <Link className="nav-link" to="/signin">
                    התחברות
                  </Link>
                )}
              </Nav>
            </Container>
          </Navbar>
        </header>
        <main>
          <Container>
            <Routes>
              <Route path='/product/:slug' element={<ProductScreen />}></Route>
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path='/' element={<HomeScreen />}></Route>
            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center">כל הזכויות שמורות©</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
