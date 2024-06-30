import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialCartState = {
    cartVisible: false,
    shoppingData: !!localStorage.getItem('shoppingData') ? JSON.parse(localStorage.getItem('shoppingData')) : [],
    status: 'idle',
    orderId: null,
};

// Utilitaire pour configurer les en-têtes d'autorisation
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    };
};

export const sendOrderAsync = createAsyncThunk(
    'cart/sendOrder',
    async ({ items, fullName, email, address, city, state, zip, totalAmount }, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/orders/create/', {
                items,
                fullName,
                email,
                address,
                city,
                state,
                zip,
                totalAmount
            }, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.detail || 'Failed to send order');
        }
    }
);

export const captureOrder = createAsyncThunk(
    'cart/captureOrder',
    async ({ orderId, paypalOrderId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/orders/${orderId}/capture/`, { paypal_order_id: paypalOrderId }, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.detail || 'Failed to capture order');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialCartState,
    reducers: {
        toggleCartVisibility: state => {
            state.cartVisible = !state.cartVisible;
        },
        addItem: (state, action) => {
            const newItem = action.payload;
            const existingItem = state.shoppingData.find(item => item.id === newItem.id);
            if (existingItem) {
                existingItem.amount += 1;
            } else {
                state.shoppingData.push({ ...newItem, amount: 1 });
            }
            // Save to local storage
            localStorage.setItem('shoppingData', JSON.stringify(state.shoppingData));
        },
        removeItem: (state, action) => {
            const id = action.payload;
            const itemIndex = state.shoppingData.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                if (state.shoppingData[itemIndex].amount > 1) {
                    state.shoppingData[itemIndex].amount -= 1; // If quantity is greater than 1, decrement it
                } else {
                    state.shoppingData.splice(itemIndex, 1); // If quantity is 1, remove the item entirely
                }
            }
            // Save to local storage
            localStorage.setItem('shoppingData', JSON.stringify(state.shoppingData));
        },
        clearItems: state => {
            state.shoppingData = [];
            // Save to local storage
            localStorage.setItem('shoppingData', JSON.stringify(state.shoppingData));
        },
        updateItemAmount: (state, action) => {
            const { id, amount } = action.payload;
            const itemToUpdate = state.shoppingData.find(item => item.id === id);
            if (itemToUpdate) {
                itemToUpdate.amount = amount;
                // Save to local storage
                localStorage.setItem('shoppingData', JSON.stringify(state.shoppingData));
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendOrderAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sendOrderAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orderId = action.payload.id;
                toast.success('Order sent successfully!');
            })
            .addCase(sendOrderAsync.rejected, (state, action) => {
                state.status = 'failed';
                toast.error(action.payload);
            })
            .addCase(captureOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(captureOrder.fulfilled, (state) => {
                state.status = 'succeeded';
                toast.success('Order captured successfully!');
                state.shoppingData = [];
                localStorage.setItem('shoppingData', JSON.stringify(state.shoppingData));
            })
            .addCase(captureOrder.rejected, (state, action) => {
                state.status = 'failed';
                toast.error(action.payload);
            });
    }
});

export const { toggleCartVisibility, addItem, removeItem, clearItems, updateItemAmount } = cartSlice.actions;
export const selectCartVisibility = state => state.cart.cartVisible;
export const selectShoppingData = state => state.cart.shoppingData;
export const selectOrderId = state => state.cart.orderId;

export default cartSlice.reducer;
