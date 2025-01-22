import FlashProvider from './FlashProvider';
import ApiProvider from './ApiProvider';
import ProductProvider from './ProductProvider';
import UserProvider from './UserProvider';
import CartProvider from './CartProvider';
import OrderProvider from './OrderProvider';
import ArtistProvider from './ArtistProvider';

const ProviderStore = ({ children }) => (
    <FlashProvider>
        <ApiProvider>
            <ProductProvider>
                <UserProvider>
                    <CartProvider>
                        <OrderProvider>
                            <ArtistProvider>
                                {children}
                            </ArtistProvider>
                        </OrderProvider>
                    </CartProvider>
                </UserProvider>
            </ProductProvider>
        </ApiProvider>
    </FlashProvider>
);

export default ProviderStore