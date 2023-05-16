import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { getError } from '../utilis';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from 'react-bootstrap/esm/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from "react-router-dom";


const ResetScreen = () => { // screen_component

  const [randomCode, setRandomCode] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState('');
  var [validEmail, setValidEmail] = useState(false);
  var [validCode, setValidCode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const websiteUrl = window.location.origin;


  const generateCode = (length) => { // יצירת קוד
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  useEffect(() => {
    setRandomCode(generateCode(15));

  }, []);
  // console.log(randomCode);



  const codeCheck = () => {
    if (code !== randomCode || code.length <= 0) {
      toast.error("הקוד לא חוקי, בדוק את האימייל שלך");
      return;
    }
    else {
      setValidCode(true);
    }
  };


  const confirmMail = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/users/reset', { email, },)
      setValidEmail(true)
      window.Email.send({
        Host: "smtp.elasticemail.com",
        Username: `${process.env.REACT_APP_MAIL_USERNAME}`,
        Password: `${process.env.REACT_APP_MAIL_PASSWORD}`,
        To: email,
        From: `${process.env.REACT_APP_MAIL_USERNAME}`,
        Subject: "הקוד לאיפוס הסיסמה",
        Body: `
          <div>
          <h2>לכניסה לאתר ואיפוס סיסמה לחץ כאן</h2>
          <a href=${websiteUrl} target="_blank" rel="noopener noreferrer">לאיפוס הסיסמה לחץ כאן</a><br><br>
          <h3> הקוד שלך הוא </h3>
          <h3> ${randomCode}</h3>
          </div>                
          `
      });

    } catch (err) {
      toast.error("אימייל לא נמצא");
    }
  }


  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("סיסמה לא מתאימה");
      return;
    }

    else if (password.length < 1) {
      toast.error("הסיסמה צריכה להיות בת 1 תווים לפחות");
      return;
    }

    else {
      try {
        await axios.put('/api/users/reset', { email, password },);
        toast.success("הסיסמא עודכנה בהצלחה");

        setTimeout(() => {
          navigate("/signin");
        }, 1500);

      } catch (err) {
        toast.error(getError(err));
      }
    };
  }



  return (
    <div className="container small-container">
      <Helmet>
        <title>איפוס סיסמה</title>
      </Helmet>
      <ListGroup><br></br>
        <ListGroup.Item>
          <h1 className="my-3">איפוס סיסמה:</h1>
        </ListGroup.Item>
        <form>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className='font-weight-bold'>הכנס מייל:</Form.Label>
            <Form.Control
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={"הכנס את כתובת המייל שלך:"}
              autoComplete="off"
            />
            <Button type="button" onClick={confirmMail}>אמת</Button>
          </Form.Group>
        </form>

        {validEmail && (
          <form>
            <Form.Group className="mb-3" controlId="code">
              <Form.Label>בדוק את האימייל שלך והזן את הקוד:</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button type="button" onClick={codeCheck} disabled={!code.length}>אימות קוד</Button>
            </div>
          </form>)}

        {validCode && (
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>סיסמה חדשה</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>אימות סיסמה חדשה</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="off"
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button type="submit" disabled={!password.length || !confirmPassword.length}>שמירה</Button>
            </div>
          </Form>
        )}
      </ListGroup>
    </div>
  )
}





export default ResetScreen