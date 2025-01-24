import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useApi } from './ApiProvider';
import { useUser } from './UserProvider';
import { useFlash } from './FlashProvider';

const CartContext = createContext();

export default function CartProvider({ children }) {
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [userCart, setUserCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0)
    const [userCartPag, setUserCartPag] = useState({ limit: 10, offset: 0, total: 0 })
    const [carts, setCarts] = useState(null);
    const [cartsPagination, setCartsPagination] = useState({ limit: 25, offset: 0, total: 0 })
    const api = useApi();
    const { user, adminUser } = useUser();
    const flash = useFlash();

    // Fetch all the carts
    const fetchPaginatedCarts = useCallback(
        async (limit = 25, offset = 0) => {
            if (adminUser) {
                try {
                    const response = await api.get('/carts', { limit, offset });
                    if (response.ok) {
                        const { data, pagination: pag } = response.body;
                        setCarts(data);
                        setCartsPagination(pag);
                        return response;
                    } else {
                        flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                        return null;
                    }
                } catch (error) {
                    console.error('Error fetching carts:', error);
                    flash && flash('An error occurred while fetching carts.', 'error');
                    return null;
                }
            }
        },
        [api, flash, adminUser]
    );

    // Get current user Cart
    const fetchPagUserCart = useCallback(async (limit = 5, offset = 0,) => {
        setIsCartLoading(true); // Set loading state
        if (user && !adminUser) {
            try {
                const cartResponse = await api.get('/me/carts', { limit, offset });
                if (cartResponse.ok) {
                    const { data, pagination: pag, extra_data: ex } = cartResponse.body;
                    setUserCart(data);
                    setUserCartPag(pag);
                    setTotalPrice(ex?.total_price);
                    return cartResponse;
                } else {
                    flash && flash(cartResponse.body?.message || "An unexpected error occurred", 'error');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching user cart:', error);
                setUserCart(); // Default to empty cart
                return [];
            } finally {
                setIsCartLoading(false); // Reset loading state
            }
        }
    }, [api, flash, adminUser]);


    useEffect(() => {
        fetchPaginatedCarts();
        fetchPagUserCart();
    }, [fetchPaginatedCarts, fetchPagUserCart]);
    // console.log("this is the user cart: " + userCart)

    // Add to cart
    const addToCart = useCallback(async (item_id) => {
        if (user) {
            const response = await api.post(`/products/carts/${item_id}`, {});
            if (response.ok) {
                flash && flash('Item added to cart', 'success');
                return response;
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [user, api, flash]);


    // Delete a customer's cart
    const deleteCart = useCallback(async (cartId) => {
        const choice = window.confirm(`Are you sure you want to delete cart ${cartId}?`);
        if (choice) {
            const response = await api.delete(`/carts/${cartId}`);
            if (response.ok) {
                flash && flash(`Successfully deleted cart ${cartId}`, 'success');
                fetchPaginatedCarts(cartsPagination.limit, cartsPagination.offset); // Re-fetch carts
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedCarts, cartsPagination.limit, cartsPagination.offset]);

    // Remove Product from Cart
    const removeFromCart = useCallback(async (cartId) => {
        const choice = window.confirm(`Are you sure you want to remove this item from cart?`);
        if (choice) {
            const response = await api.delete(`/me/carts/${cartId}`);
            if (response.ok) {
                flash && flash(`Successfully deleted cart ${cartId}`, 'success');
                // Update the user's cart after removing the product
                fetchPagUserCart(userCartPag.limit, userCartPag.offset);
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPagUserCart, userCartPag.limit, userCartPag.offset]);

    // Increment product's quantity in the cart
    const incrementQuantity = useCallback(async () => {
        if (user) {
            console.log('User is incrementing quantity in cart');
        }
    }, [user])

    // Decrement product's quantity in the cart
    const decrementQuantity = useCallback(async () => {
        if (user) {
            console.log('User is decrementing quantity in cart');
        }
    }, [user])

    return (
        <CartContext.Provider value={{
            carts,
            userCart,
            setUserCart,
            totalPrice,
            isCartLoading,
            removeFromCart,
            addToCart,
            deleteCart,
            incrementQuantity,
            decrementQuantity,
            fetchPagUserCart,
            fetchPaginatedCarts,
            userCartPag,
            cartsPagination
        }}>
            {children}
        </CartContext.Provider>

    );
}

export function useCart() {
    return useContext(CartContext);
}
