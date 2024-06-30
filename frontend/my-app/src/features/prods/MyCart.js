import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    selectShoppingData,
    clearItems,
    updateItemAmount,
    removeItem,
} from '../cart/cartSlice';
import { Container, Typography, Button, IconButton, Badge, Grid, Card, CardMedia, CardContent,  } from '@mui/material';
import { BASE_URL } from './prodsAPI';
import { toast } from 'react-toastify';

const MyCart = () => {
    const shoppingData = useSelector(selectShoppingData);
    const dispatch = useDispatch();

    const Remove = (id) => {
        dispatch(removeItem(id));
    };

    const clearCart = () => {
        dispatch(clearItems());
        console.log('Cart cleared');
        toast.success('Cart cleared successfully!');
    };

    const updateQuantity = (id, amount) => {
        if (amount <= 0) {
            dispatch(removeItem(id));
        }
        dispatch(updateItemAmount({ id, amount }));
    };

    return (
        <Container className="cart-container" style={{ position: 'absolute', top: 60, right: 5, width: 500, padding: '5px 20px 15px 20px' }}>
            <Grid container spacing={5} style={{ backgroundColor: '#ccc', padding: '5px 5px 50px 5px' }}>
                <Grid item xs={12}>
                    <Typography variant="h6" component="h4" gutterBottom>
                        <span className="text-primary">Your cart <i className="fa fa-shopping-cart"></i></span>
                        <Badge badgeContent={shoppingData.length} color="primary" overlap="rectangle" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
                    </Typography>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {shoppingData.length === 0 && <Typography variant="body1" align="center">Cart is empty</Typography>}
                        {shoppingData.map((item) => (
                            <li key={item.id}>
                                <Card style={{ display: 'flex', marginBottom: '10px' }}>
                                    <CardMedia
                                        component="img"
                                        image={`${BASE_URL}${item.img}`}
                                        alt={item.name}
                                        style={{ width: '50px', height: '50px', marginLeft: '10px' }}
                                    />
                                    <CardContent style={{ flex: '1 0 auto' }}>
                                        <Typography variant="subtitle1">{item.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">Quantity: {item.amount}</Typography>
                                        <Typography variant="body2" color="textSecondary">(${item.price} each)</Typography>
                                    </CardContent>
                                    <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton onClick={() => updateQuantity(item.id, item.amount - 1)} size="small" color="secondary">
                                            -
                                        </IconButton>
                                        <IconButton onClick={() => updateQuantity(item.id, item.amount + 1)} size="small" color="secondary">
                                            +
                                        </IconButton>
                                        <IconButton onClick={() => Remove(item.id)} size="small" color="secondary">
                                            Remove
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                        {shoppingData.length > 0 && (
                            <li>
                                <Card style={{ marginBottom: '10px' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1">Total (USD)</Typography>
                                        <Typography variant="h6">
                                            ${shoppingData.reduce((acc, curr) => acc + curr.price * curr.amount, 0)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </li>
                        )}
                    </ul>
                    {shoppingData.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={clearCart} variant="contained" color="secondary">
                                Clear Cart
                            </Button>
                            <Button component={Link} to="/checkout" variant="contained" color="primary">
                                Checkout
                            </Button>
                        </div>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default MyCart;
