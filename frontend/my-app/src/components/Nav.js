import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar, Typography, IconButton, Button, Badge, Menu, MenuItem } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { checkTokenExpiration, handleLogout, selectIsLoggedIn, selectUsername } from '../features/login/loginSlice';
import MyCart from '../features/prods/MyCart';
import { selectCartVisibility, toggleCartVisibility } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';

const Nav = () => {
    const cartVisible = useSelector(selectCartVisibility);
    const logged = useSelector(selectIsLoggedIn);
    const username = useSelector(selectUsername);
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const toggleCart = (event) => {
        event.stopPropagation(); // Stop the event from bubbling up (handleClickOutside function)
        dispatch(toggleCartVisibility());
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        dispatch(handleLogout());
        toast.success('Logged out successfully!');
        window.location.href = '/';
    }

    useEffect(() => {
        dispatch(checkTokenExpiration());

        const intervalId = setInterval(() => {
            dispatch(checkTokenExpiration());
        }, 60000); // Check every 60 seconds

        return () => clearInterval(intervalId);
    }, [dispatch]);

    useEffect(() => {
        if (cartVisible) {
            const handleClickOutside = (event) => {
                const cartContainer = document.querySelector('.cart-container');
                if (cartContainer && !cartContainer.contains(event.target)) {
                    dispatch(toggleCartVisibility());
                }
            };

            document.addEventListener('click', handleClickOutside);

            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [cartVisible, dispatch]);

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: 'gray' }}>
                <Toolbar>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <img src="/logo_super.png" alt="Logo" style={{ width: "60px", margin: "5px" }} />
                        </IconButton>
                    </Link>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Link to="/" style={{ color: 'black', textDecoration: 'none' }}>My Supermarket</Link>
                    </Typography>
                    <IconButton color="inherit" onClick={(event) => toggleCart(event)}>
                        <Badge badgeContent={0} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>
                    {!logged && <Button component={Link} to="/register" color="inherit">Register</Button>}
                    {logged && (
                        <>
                            <IconButton color="inherit" onClick={handleMenu}>
                                <AccountCircleIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem component={Link} to="/profile" onClick={handleClose}>{username}</MenuItem>
                                <MenuItem component={Link} to="/orders" onClick={handleClose}>Orders</MenuItem> {/* Ajout du lien vers les commandes */}
                                <MenuItem onClick={handleLogoutClick}><LogoutIcon /> Logout</MenuItem>
                            </Menu>
                        </>
                    )}
                    {!logged && <Button component={Link} to="/login" color="inherit">Login</Button>}
                </Toolbar>
            </AppBar>
            {cartVisible && <MyCart />}
        </div>
    );
}

export default Nav;
