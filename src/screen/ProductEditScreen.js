import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import axios from 'axios';
import LoadinBox from '../components/LoadinBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from "../utilis.js";
import Form from 'react-bootstrap/Form';
import { Card, Container, ListGroup } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return {
                ...state,
                loadingUpload: false,
                errorUpload: '',
            };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payload };

        default:
            return state;
    }
};


export default function ProductListScreen() {
    const navigate = useNavigate();

    const params = useParams(); // /product/:id
    const { id: productId } = params;

    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
        loading: true,
        error: "",

    });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');

    const uploadFileHandler = async (e, forImages) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: 'UPLOAD_SUCCESS' });

            if (forImages) {
                setImages([...images, data.secure_url]);
            } else {
                setImage(data.secure_url);
            }
            toast.success("התמונה הועלתה בהצלחה. לחץ על עדכן כדי להחיל אותה");
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
        }
    };


    const deleteFileHandler = async (fileName, f) => {
        console.log(fileName, f);
        console.log(images);
        console.log(images.filter((x) => x !== fileName));
        setImages(images.filter((x) => x !== fileName));
        toast.success("התמונה הוסרה בהצלחה. לחץ על עדכן כדי להחיל אותה");
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/products/product/${productId}`);
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setImage(data.image);
                setImages(data.images);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setBrand(data.brand);
                setDescription(data.description);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };
        fetchData();
    }, [productId]);


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(`/api/products/product/${productId}`,
                { _id: productId, name, slug, price, image, images, category, brand, countInStock, description, },
                { headers: { Authorization: `Bearer ${userInfo.token}` }, }
            );
            dispatch({
                type: 'UPDATE_SUCCESS',
            });
            toast.success("המוצר עודכן בהצלחה");
            navigate('/admin/products');
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'UPDATE_FAIL' });
        }
    };


    return (
        <Container className="small-container">
            <Helmet>
                <title> עריכת מוצר{productId}</title>
            </Helmet>
            <h1> עריכת מוצר</h1>
            <h3>{productId}</h3>

            {loading ? (
                <LoadinBox></LoadinBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>שם</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="slug">
                        <Form.Label>סלאג</Form.Label>
                        <Form.Control
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>מחיר</Form.Label>
                        <Form.Control
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>שנה תמונה ראשית</Form.Label>
                        <Form.Control type="file" onChange={uploadFileHandler} />
                        {loadingUpload && <LoadinBox></LoadinBox>}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="additionalImage">
                        <Form.Label>כל תמונות המוצר</Form.Label>
                        {images.length === 0 && image.length === 0 && <MessageBox>אין תמונה</MessageBox>}
                        <Card>
                            <ListGroup variant="flush">
                                {
                                    <ListGroup.Item key={image}>
                                        תמונה ראשית:
                                        <br></br>
                                        <img src={image} alt={image} width="200" />
                                    </ListGroup.Item>
                                }
                                {images.map((x) => (
                                    <ListGroup.Item key={x}>
                                        <Button variant="light" id="deleteImage" onClick={() => deleteFileHandler(x)}>
                                            <i className="fa fa-times-circle"></i>
                                        </Button>&nbsp;
                                        {x.slice(62)}
                                        <br></br>
                                        <img src={x} alt={x} width="200" />
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="additionalImageFile">
                        <Form.Label>העלה עוד תמונות</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => uploadFileHandler(e, true)}
                        />
                        {loadingUpload && <LoadinBox></LoadinBox>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>קטגוריה</Form.Label>
                        <Form.Select aria-label="Default select example" value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option>בחר קטגוריה</option>
                            <option value="אלקטרוניקה">אלקטרוניקה</option>
                            <option value="מחשבים">מחשבים</option>
                            <option value="בגדי גברים">בגדי גברים</option>
                            <option value="בגדי נשים">בגדי נשים</option>
                            <option value="תינוקות">תינוקות</option>
                            <option value="משחקי וידאו">משחקי וידאו</option>
                            <option value="מוזיקה">מוזיקה</option>
                            <option value="בית ומטבח">בית ומטבח</option>
                        </Form.Select>

                    </Form.Group>
                    <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>מותג</Form.Label>
                        <Form.Control
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="countInStock">
                        <Form.Label>כמות במלאי</Form.Label>
                        <Form.Control
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>תיאור</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="mb-3">
                        <Button disabled={loadingUpdate} type="submit">
                            עדכון
                        </Button>
                        {loadingUpdate && <LoadinBox></LoadinBox>}
                    </div>
                </Form>
            )}
        </Container>
    );
}
