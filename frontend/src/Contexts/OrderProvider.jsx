import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useApi } from "./ApiProvider";
import { useFlash } from "./FlashProvider";
import { useUser } from "./UserProvider";

const OrderContext = createContext();

const OrderProvider = ({ children }) => {
    const [orders, setOrder] = useState(null);
    const [ordersPagination, setOrdersPagination] = useState({ limit: 25, offset: 0, total: 0 });
    const api = useApi();
    const { adminUser } = useUser();
    const flash = useFlash();


    const fetchPaginatedOrders = useCallback(
        async (limit = 25, offset = 0) => {
            if (adminUser) {
                try {
                    const response = await api.get('/orders', { limit, offset });
                    if (response.ok) {
                        const { data, pagination: pag } = response.body;
                        setOrder(data);
                        setOrdersPagination(pag);
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

    useEffect(() => {
        fetchPaginatedOrders();
    }, [fetchPaginatedOrders]);

    // Remove from cart
    const deleteOrder = useCallback(async (orderId) => {
        const choice = window.confirm(`Are you sure you want to delete order ${orderId}?`);
        if (choice) {
            const response = await api.delete(`/orders/${orderId}`);
            if (response.ok) {
                flash && flash(`Successfully deleted order ${orderId}`, 'success');
                fetchPaginatedOrders(ordersPagination.limit, ordersPagination.offset); // Re-fetch carts
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedOrders, ordersPagination.limit, ordersPagination.offset]);

    return (
        <OrderContext.Provider value={{ orders, ordersPagination, deleteOrder, fetchPaginatedOrders }}>
            {children}
        </OrderContext.Provider>
    )
}

export default OrderProvider

export function useOrder() {
    return useContext(OrderContext);
}