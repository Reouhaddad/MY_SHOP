import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDataAsync, getDataAsync, addDataAsync, updateDataAsync, selectProds } from './prodsSlice';
import { selectIsLoggedIn, selectIsSuperuser, selectToken } from '../login/loginSlice'; // Import the token selector
import { addItem } from '../cart/cartSlice';
import { toast } from 'react-toastify';
import './Prods.css';
import { BASE_URL } from './prodsAPI';
import {
    Container, Grid, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Card, CardMedia,
    CardContent, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemText
} from '@mui/material';
import axios from 'axios';

const Prods = () => {
    const prods = useSelector(selectProds);
    const isSuperuser = useSelector(selectIsSuperuser);
    const token = useSelector(selectToken); // Get the token from the state
    const dispatch = useDispatch();
    const [refresh, setRefresh] = useState(true);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Dairy');
    const [img, setImg] = useState(null);
    const isLogged = useSelector(selectIsLoggedIn);
    const [filteredCategory, setFilteredCategory] = useState(null);
    const [openAddProductDialog, setOpenAddProductDialog] = useState(false);

    const [open, setOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        dispatch(getDataAsync());
    }, [refresh, dispatch]);

    const fetchReviews = async (productId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/products/${productId}/reviews/`);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleDelete = async (id) => {
        await dispatch(deleteDataAsync(id));
        setRefresh(!refresh);
    };

    const handleAdd = async () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        if (img !== null) {
            formData.append("img", img);
        }
        await dispatch(addDataAsync(formData));
        setRefresh(!refresh);
        setOpenAddProductDialog(false);
    };

    const handleUpdate = async () => {
        if (img === null) {
            await dispatch(updateDataAsync({ name, price, category, id: currentProduct.id }));
        } else {
            const formData = new FormData();
            formData.append("id", currentProduct.id);
            formData.append("name", name);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("img", img);
            await dispatch(updateDataAsync(formData));
        }
        setRefresh(!refresh);
        handleClose();
    };

    const buyProduct = (id) => {
        const product = prods.find(prod => prod.id === id);
        dispatch(addItem(product));
        toast.success(`${product.name} added to cart`);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImg(file);
    };

    const filterByCategory = (category) => {
        setFilteredCategory(category);
    };

    const clearFilter = () => {
        setFilteredCategory(null);
    };

    const handleClickOpen = (product) => {
        setCurrentProduct(product);
        setName(product.name);
        setPrice(product.price);
        setCategory(product.category);
        setImg(null);
        setOpen(true);
    };

    const handleImageClick = (product) => {
        setCurrentProduct(product);
        fetchReviews(product.id);
        setImageDialogOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImageDialogOpen(false);
    };

    const handleUpdateProduct = () => {
        setOpen(true);
    };

    const handleDeleteProduct = () => {
        dispatch(deleteDataAsync(currentProduct.id));
        setRefresh(!refresh);
        handleClose();
    };

    const handleAddProduct = () => {
        setOpenAddProductDialog(true);
    };

    const handleAddReview = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/products/${currentProduct.id}/reviews/`, {
                rating,
                comment,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setReviews([...reviews, response.data]);
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Failed to add review:', error);
        }
    };

    return (
        <Container className="mt-5">
            <br /><br />
            {isSuperuser && (
                <>
                    <Button variant="contained" color="inherit" onClick={handleAddProduct} className="mb-3">
                        Add Product
                    </Button>
                    <Dialog open={openAddProductDialog} onClose={() => setOpenAddProductDialog(false)}>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Fill in the details below to add a new product:
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Name"
                                type="text"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="Price"
                                type="number"
                                fullWidth
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <FormControl fullWidth margin="dense" variant="outlined">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <MenuItem value="Dairy">Dairy</MenuItem>
                                    <MenuItem value="Fruits">Fruits</MenuItem>
                                    <MenuItem value="Bakery">Bakery</MenuItem>
                                    <MenuItem value="Vegetables">Vegetables</MenuItem>
                                    <MenuItem value="House Cleaning">House Cleaning</MenuItem>
                                </Select>
                            </FormControl>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ margin: '10px 0' }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAddProductDialog(false)} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleAdd} color="primary">
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
            <br /><br /><br />
            <Grid container spacing={3}>
                <Grid item xs={12} className="mb-4">
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === null ? 'active' : ''}`} onClick={clearFilter}>
                        All
                    </Button>
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === 'Dairy' ? 'active' : ''}`} onClick={() => filterByCategory('Dairy')}>
                        Dairy
                    </Button>
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === 'Fruits' ? 'active' : ''}`} onClick={() => filterByCategory('Fruits')}>
                        Fruits
                    </Button>
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === 'Bakery' ? 'active' : ''}`} onClick={() => filterByCategory('Bakery')}>
                        Bakery
                    </Button>
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === 'Vegetables' ? 'active' : ''}`} onClick={() => filterByCategory('Vegetables')}>
                        Vegetables
                    </Button>
                    <Button variant="outlined" color="secondary" className={`btn ${filteredCategory === 'House Cleaning' ? 'active' : ''}`} onClick={() => filterByCategory('House Cleaning')}>
                        House Cleaning
                    </Button>
                </Grid>
                {prods
                    .filter((prod) => filteredCategory === null || prod.category === filteredCategory)
                    .map((prod) => (
                        <Grid item xs={12} md={4} key={prod.id} className="mb-4">
                            <Card style={{ border: '1px solid black', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {prod.img ? (
                                    <CardMedia
                                        component="img"
                                        style={{ width: 200, height: 200, objectFit: 'cover', cursor: 'pointer' }}
                                        image={`${BASE_URL}${prod.img}`}
                                        alt={prod.name}
                                        onClick={() => handleImageClick(prod)}
                                    />
                                ) : (
                                    <CardMedia
                                        component="img"
                                        style={{ width: 200, height: 200, objectFit: 'cover', cursor: 'pointer' }}
                                        image={`${BASE_URL}/media/default.jpg`}
                                        alt="Default"
                                        onClick={() => handleImageClick(prod)}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {prod.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ${prod.price}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {prod.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    {isSuperuser && (
                                        <>
                                            <Button variant="contained" color="error" onClick={() => handleDelete(prod.id)} style={{ margin: '5px' }}>
                                                Delete
                                            </Button>
                                            <Button variant="contained" color="warning" onClick={() => handleClickOpen(prod)}>
                                                Update
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="contained" color="success" onClick={() => buyProduct(prod.id)} className="btn-block">
                                        +
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
            </Grid>
            {currentProduct && (
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Update Product</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Update the product details below:
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Price"
                            type="number"
                            fullWidth
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <FormControl fullWidth margin="dense" variant="outlined">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <MenuItem value="Dairy">Dairy</MenuItem>
                                <MenuItem value="Fruits">Fruits</MenuItem>
                                <MenuItem value="Bakery">Bakery</MenuItem>
                                <MenuItem value="Vegetables">Vegetables</MenuItem>
                                <MenuItem value="House Cleaning">House Cleaning</MenuItem>
                            </Select>
                        </FormControl>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ margin: '10px 0' }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            {currentProduct && (
                <Dialog open={imageDialogOpen} onClose={handleClose}>
                    <DialogTitle>Product Details</DialogTitle>
                    <DialogContent>
                        <CardMedia
                            component="img"
                            style={{ width: '100%', objectFit: 'cover' }}
                            image={`${BASE_URL}${currentProduct.img}`}
                            alt={currentProduct.name}
                        />
                        <Typography variant="h5" component="div" style={{ marginTop: '10px' }}>
                            {currentProduct.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            ${currentProduct.price}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {currentProduct.description}
                        </Typography>
                        <List>
                            {reviews.map(review => (
                                <ListItem key={review.id} alignItems="flex-start">
                                    <ListItemText
                                        primary={review.user}
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textPrimary">{review.comment}</Typography>
                                                <Typography variant="body2" color="textSecondary">Rating: {review.rating}</Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <div>
                            <Typography variant="h6" component="div" style={{ marginTop: '10px' }}>
                                Add a Review
                            </Typography>
                            <TextField
                                label="Rating"
                                type="number"
                                fullWidth
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                            <TextField
                                label="Comment"
                                type="text"
                                fullWidth
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                multiline
                                rows={4}
                                style={{ marginBottom: '10px' }}
                            />
                            <Button variant="contained" color="primary" onClick={handleAddReview}>
                                Submit
                            </Button>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        {isSuperuser && (
                            <>
                                <Button variant="contained" color="secondary" onClick={handleDeleteProduct}>
                                    Delete
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleUpdateProduct}>
                                    Update
                                </Button>
                            </>
                        )}
                        <Button variant="contained" color="success" onClick={() => buyProduct(currentProduct.id)} className="btn-block">
                            Add to cart
                        </Button>
                        <Button onClick={handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default Prods;
