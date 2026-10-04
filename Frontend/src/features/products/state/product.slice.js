import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
    name: 'product',
    initialState: {
        sellerProducts: [],
        products: [], // New state for all products
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload;
        },
        setProducts: (state, action) => {
            state.products = action.payload;
        },
    },
});

export const { setSellerProducts, setProducts } = productSlice.actions;
export default productSlice.reducer;