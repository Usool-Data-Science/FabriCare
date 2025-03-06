import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";
import { useFlash } from "./FlashProvider";

const ProductContext = createContext();

const ProductProvider = ({ children }) => {
    const api = useApi();
    const [products, setProducts] = useState(null);
    const [productPagination, setProductPagination] = useState({ limit: 25, offset: 0, total: 0 });
    const flash = useFlash();

    const fetchPaginatedProducts = useCallback(async (limit = 25, offset = 0) => {
        try {
            const response = await api.get('/products', { limit, offset });
            if (response.ok) {
                const { data, pagination: pag } = response.body;
                setProducts(data);
                setProductPagination(pag);
                return response;
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching paginated products:', error);
            flash && flash('An error occurred while fetching products.', 'error');
            return null;
        }
    }, [api, flash]);


    const fetchProduct = useCallback(async (productId) => {
        try {
            const response = await api.get(`/sales/${productId}`);

            if (response.ok) {
                return response.body;
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            flash && flash(`An error occurred while fetching product ${productId}`, 'error');
            return null;
        }
    }, [api, flash]);

    const updateProduct = useCallback(async (url, body) => {
        const response = await api.put(url, body, { type: 'form' });
        if (response.ok) {
            flash && flash("Product updated successfully", 'success')
            return response;
        } else {
            const errors = response.body?.errors?.json || response.body?.errors?.form;
            if (errors) {
                const errorMessage = Object.values(errors)[0]
                    .flat()
                    .join(", ");
                errorMessage.replace('Unauthorized', 'Your session timed out, please login again!')
                flash && flash(errorMessage, 'error');
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
            return response;
        }
    }, [api, flash])

    const createProduct = useCallback(async (url, body) => {
        const response = await api.post(url, body, { type: 'form' });
        if (response.ok) {
            flash && flash("Product created successfully", 'success')
            return response;
        } else {
            const errors = response.body?.errors?.json || response.body?.errors?.form;
            if (errors) {
                const errorMessage = Object.values(errors)[0]
                    .flat()
                    .join(", ");
                errorMessage.replace('Unauthorized', 'Your session timed out, please login again!')
                flash && flash(errorMessage, 'error');
            } else {
                flash && flash(response.body?.description || "An unexpected error occurred", 'error');
            }
            return response;
        }
    }, [api, flash])

    const deleteProduct = useCallback(async (productId) => {
        const choice = window.confirm(`Are you sure you want to delete product ID: ${productId}?`);
        if (choice) {
            const response = await api.delete(`/products/${productId}`);
            if (response.ok) {
                flash && flash(`Successfully deleted product ID: ${productId}`, 'success');
                fetchPaginatedProducts(productPagination.limit, productPagination.offset); // Re-fetch products
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedProducts, productPagination]);

    const deleteAllProducts = useCallback(async () => {
        const choice = window.confirm(`Are you sure you want to delete ALL products?`);
        if (choice) {
            const response = await api.delete('/products-all');
            if (response.ok) {
                flash && flash("Successfully deleted all products", 'success');
                fetchPaginatedProducts(productPagination.limit, productPagination.offset); // Re-fetch products
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedProducts, productPagination]);

    useEffect(() => {
        fetchPaginatedProducts();
    }, [fetchPaginatedProducts]);

    const expireAllProducts = useCallback(async () => {
        const choice = window.confirm(`Are you sure you want to expire ALL products?`);
        if (choice) {
            const response = await api.put('/products-all', {});
            if (response.ok) {
                flash && flash("Successfully expired all products", 'success');
                fetchPaginatedProducts(productPagination.limit, productPagination.offset); // Re-fetch products
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedProducts, productPagination]);

    const expireProduct = useCallback(async (productId, title) => {
        const choice = window.confirm(`Are you sure you want to expire ${title}?`);
        if (choice) {
            const response = await api.put(`/expire/${productId}`, {});
            if (response.ok) {
                flash && flash(`${title} has been expired!`, 'success');
                fetchPaginatedProducts(productPagination.limit, productPagination.offset); // Re-fetch products
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedProducts, productPagination]);

    useEffect(() => {
        fetchPaginatedProducts();
    }, [fetchPaginatedProducts]);

    return (
        <ProductContext.Provider value={{ products, setProducts, productPagination, fetchProduct, updateProduct, createProduct, fetchPaginatedProducts, deleteProduct, deleteAllProducts, expireProduct, expireAllProducts }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductProvider;

export function useProduct() {
    return useContext(ProductContext);
}
