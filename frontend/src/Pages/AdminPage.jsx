import { MdDeleteForever } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import Body from "../Components/Body";
import TimeAgo from '../Components/TimeAgo';
import { useProduct } from "../Contexts/ProductProvider";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../Contexts/UserProvider";
import { useCart } from "../Contexts/CartProvider";
import { useOrder } from "../Contexts/OrderProvider";
import { useApi } from "../Contexts/ApiProvider";
import NewProduct from "./NewProduct";
import { useArtist } from "../Contexts/ArtistProvider";
import RegisterArtist from "./NewArtist";

const AdminPage = () => {
    const { products, productPagination, fetchPaginatedProducts, deleteProduct } = useProduct();
    const { allUsers, userPagination, fetchPaginatedUsers, deleteUser } = useUser();
    const { carts, cartsPagination, fetchPaginatedCarts, deleteCart } = useCart();
    const { orders, ordersPagination, fetchPaginatedOrders, deleteOrder } = useOrder();
    const { artists, artistsPagination, fetchPaginatedArtists, deleteArtist } = useArtist();

    const [currentArtistsPage, setCurrentArtistsPage] = useState(1);
    const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
    const [currentCartsPage, setCurrentCartsPage] = useState(1);
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const api = useApi();


    const handleArtistNext = () => {
        if (artistsPagination.limit + artistsPagination.offset < artistsPagination.total) {
            fetchPaginatedArtists(artistsPagination.limit, artistsPagination.offset + artistsPagination.limit);
            setCurrentArtistsPage(currentOrdersPage + 1);
        }
    }

    const handleArtistPrevious = () => {
        if (ordersPagination.offset > 0) {
            fetchPaginatedArtists(ordersPagination.limit, ordersPagination.offset - ordersPagination.limit);
            setCurrentArtistsPage(currentOrdersPage - 1);
        }
    }

    const handleOrderNext = () => {
        if (ordersPagination.limit + ordersPagination.offset < ordersPagination.total) {
            fetchPaginatedOrders(ordersPagination.limit, ordersPagination.offset + ordersPagination.limit);
            setCurrentOrdersPage(currentOrdersPage + 1);
        }
    }

    const handleOrderPrevious = () => {
        if (ordersPagination.offset > 0) {
            fetchPaginatedOrders(ordersPagination.limit, ordersPagination.offset - ordersPagination.limit);
            setCurrentOrdersPage(currentOrdersPage - 1);
        }
    }

    const handleCartsNext = () => {
        if (cartsPagination.offset + cartsPagination.limit < cartsPagination.total) {
            fetchPaginatedCarts(cartsPagination.limit, cartsPagination.offset + cartsPagination.limit);
            setCurrentCartsPage(currentCartsPage + 1);
        }
    }

    const handleCartsPrevious = () => {
        if (cartsPagination.offset > 0) {
            fetchPaginatedCarts(cartsPagination.limit, cartsPagination.offset - cartsPagination.limit);
            setCurrentCartsPage(currentCartsPage - 1);
        }
    }


    const handleUserNext = () => {
        if ((userPagination.offset + userPagination.limit) < userPagination.total) {
            fetchPaginatedUsers(userPagination.limit, userPagination.offset + userPagination.limit);
            setCurrentUserPage(currentUserPage + 1);
        }
    };

    const handleUserPrevious = () => {
        if (userPagination.offset > 0) {
            fetchPaginatedUsers(userPagination.limit, userPagination.offset - userPagination.limit);
            setCurrentUserPage(currentUserPage - 1);
        }
    };

    const handleProductNext = () => {
        if ((productPagination.offset + productPagination.limit) < productPagination.total) {
            fetchPaginatedProducts(productPagination.limit, productPagination.offset + productPagination.limit);
            setCurrentProductPage(currentProductPage + 1);
        }
    };

    const handleProductPrevious = () => {
        if (productPagination.offset > 0) {
            fetchPaginatedProducts(productPagination.limit, productPagination.offset - productPagination.limit);
            setCurrentProductPage(currentProductPage - 1);
        }
    };

    return (
        <Body search>
            <div role="tablist" className="tabs tabs-lifted mt-4">
                {/* Create New Product */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Product+" />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <NewProduct />
                </div>
                {/* Product tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Products" defaultChecked />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-x-auto">
                    {products === null && <span className="loading loading-ring loading-lg"></span>}
                    {products?.length <= 0 && <p>No products to display</p>}
                    {products?.length > 0 && (
                        <div>
                            <table className="table">
                                {/* Table head */}
                                <thead className="text-gray-100">
                                    <tr>
                                        <th>#</th>
                                        {products.length > 0 &&
                                            Object.keys(products[0]).map(k => (
                                                <th key={k}>{k}</th>
                                            ))
                                        }
                                        <th>Config</th>
                                    </tr>
                                </thead>

                                {/* Table body */}
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id}>
                                            <th className="text-center align-middle">
                                                {index + 1 + productPagination.offset}
                                            </th>
                                            {Object.keys(product).map((k) => (
                                                <td key={k} className="text-center align-middle">
                                                    {k === "mainImage" ? (
                                                        <div className="avatar">
                                                            <div className="w-14 rounded-xl">
                                                                <img
                                                                    src={api.image_path + product[k]}
                                                                    alt={product.title}
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : k === "subImages" ? (
                                                        <div className="avatar-group -space-x-6 rtl:space-x-reverse">
                                                            {product[k]?.map((p_img, i) => (
                                                                <div className="avatar" key={i}>
                                                                    <div className="w-12">
                                                                        <img
                                                                            src={api.image_path + p_img}
                                                                            alt={`SubImage ${i}`}
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="avatar placeholder">
                                                                <div className="bg-neutral text-neutral-content w-12 flex items-center justify-center">
                                                                    <span>{product[k]?.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : k === "first_seen" || k === "last_seen" ? (
                                                        <TimeAgo isoDate={product[k]} />
                                                    ) : k === "sizes" ? (
                                                        <span>{product[k].join(" , ")}</span>
                                                    ) : (
                                                        product[k]
                                                    )}
                                                </td>
                                            ))}
                                            <td>
                                                <Link to={`/products/${product.id}`} className="text-green-200">
                                                    <TiEdit size={30} />
                                                </Link>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="text-red-600"
                                                >
                                                    <MdDeleteForever size={30} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* productPagination Controls */}
                            <div className="flex justify-between mt-4 text-gray-100">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleProductPrevious}
                                    disabled={productPagination.offset === 0}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {currentProductPage} of {Math.ceil(productPagination.total / productPagination.limit)}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleProductNext}
                                    disabled={(productPagination.offset + productPagination.limit) >= productPagination.total}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Customer Tab */}
                <input
                    type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Customers"
                />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <div className="overflow-x-auto">
                        {allUsers === null && <span className="loading loading-ring loading-lg"></span>}
                        {allUsers?.length === 0 && <p>No users to display</p>}
                        {allUsers && (
                            <>
                                <table className="table">
                                    <thead className="text-gray-100">
                                        <tr>
                                            <th>#</th>
                                            {Object.keys(allUsers[0]).map((k) => (
                                                <th key={k}>{k}</th>
                                            ))}
                                            <th>Config</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((user, index) => (
                                            <tr key={user.username}>
                                                <th>{index + 1 + userPagination.offset}</th>
                                                {Object.keys(user).map((k) => (
                                                    k === 'first_seen' || k === 'last_seen' ?
                                                        <td key={k}><TimeAgo isoDate={user[k]} /></td> :
                                                        <td key={k}>{user[k]}</td>
                                                ))}
                                                <td className="flex gap-4">
                                                    {/* <Link className="text-green-200">
                                                        <TiEdit size={30} />
                                                    </Link> */}
                                                    <button
                                                        onClick={() => deleteUser(user.username, user.id)}
                                                        className="text-red-600"
                                                    >
                                                        <MdDeleteForever size={30} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* User Pagination Controls */}
                                <div className="flex justify-between mt-4 text-gray-100">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleUserPrevious}
                                        disabled={userPagination.offset === 0}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentUserPage} of {Math.ceil(userPagination.total / userPagination.limit)}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleUserNext}
                                        disabled={(userPagination.offset + userPagination.limit) >= userPagination.total}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* Carts tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Carts" />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <div className="overflow-x-auto">
                        {carts === null && <span className="loading loading-ring loading-lg"></span>}
                        {carts?.length === 0 && <p>No carts to display</p>}
                        {carts?.length > 0 && (
                            <>
                                <table className="table">
                                    <thead className="text-gray-100">
                                        <tr>
                                            <th>#</th>
                                            {Object.keys(carts[0]).map((k) => (
                                                <th key={k}>{k}</th>
                                            ))}
                                            <th>Config</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carts.map((cart, index) => (
                                            <tr key={cart.id}>
                                                <th>{index + 1 + cartsPagination.offset}</th>
                                                {Object.keys(cart).map((k) => (
                                                    k === 'product' ?
                                                        <td key={k}>{cart[k].title}</td>
                                                        :
                                                        k === 'customer' ?
                                                            <td key={k}>{cart[k].username}</td>
                                                            :
                                                            k === 'first_seen' || k === 'last_seen' ?
                                                                <td key={k}><TimeAgo isoDate={cart[k]} /></td> :
                                                                <td key={k}>{cart[k]}</td>
                                                ))}
                                                <td className="flex gap-4">
                                                    {/* <Link className="text-green-200">
                                                        <TiEdit size={30} />
                                                    </Link> */}
                                                    <button
                                                        onClick={() => deleteCart(cart.id)}
                                                        className="text-red-600"
                                                    >
                                                        <MdDeleteForever size={30} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Carts Pagination Controls */}
                                <div className="flex justify-between mt-4 text-gray-100">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCartsPrevious}
                                        disabled={cartsPagination.offset === 0}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentCartsPage} of {Math.ceil(cartsPagination.total / cartsPagination.limit)}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCartsNext}
                                        disabled={(cartsPagination.offset + cartsPagination.limit) >= cartsPagination.total}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Orders tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Orders" />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <div className="overflow-x-auto">
                        {orders === null && <span className="loading loading-ring loading-lg"></span>}
                        {orders?.length === 0 && <p>No orders to display</p>}
                        {orders?.length > 0 && (
                            <>
                                <table className="table">
                                    <thead className="text-gray-100">
                                        <tr>
                                            <th>#</th>
                                            {Object.keys(orders[0]).map((k) => (
                                                <th key={k}>{k}</th>
                                            ))}
                                            <th>Config</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
                                            <tr key={order.id}>
                                                <th>{index + 1 + ordersPagination.offset}</th>
                                                {Object.keys(order).map((k) => (
                                                    k === 'product' ? (
                                                        <td key={k}>{order[k].title}</td>
                                                    ) : k === 'customer' ? (
                                                        <td key={k}>{order[k].username}</td>
                                                    ) : k === 'timestamp' ? (
                                                        <td key={k}><TimeAgo isoDate={order[k]} /></td>
                                                    ) : k === 'products' ? (
                                                        <td key={k}>{order[k].map(ob => ob.title).join(', ')}</td>
                                                    ) : (
                                                        <td key={k}>{order[k]}</td>
                                                    )
                                                ))}
                                                <td className="flex gap-4">
                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="text-red-600"
                                                    >
                                                        <MdDeleteForever size={30} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>

                                {/* Orders Pagination Controls */}
                                <div className="flex justify-between mt-4 text-gray-100">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleOrderPrevious}
                                        disabled={ordersPagination.offset === 0}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentOrdersPage} of {Math.ceil(ordersPagination.total / ordersPagination.limit)}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleOrderNext}
                                        disabled={(ordersPagination.offset + ordersPagination.limit) >= ordersPagination.total}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Artist tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Artists" />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <div className="overflow-x-auto">
                        {artists === null && <span className="loading loading-ring loading-lg"></span>}
                        {artists?.length === 0 && <p>No artists to display</p>}
                        {artists?.length > 0 && (
                            <>
                                <table className="table">
                                    <thead className="text-gray-100">
                                        <tr>
                                            <th>#</th>
                                            {Object.keys(artists[0]).map((k) => (
                                                <th key={k}>{k}</th>
                                            ))}
                                            <th>Config</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {artists.map((artist, index) => (
                                            <tr key={artist.id}>
                                                <th>{index + 1 + artistsPagination.offset}</th>
                                                {Object.keys(artist).map((k) => (
                                                    k === 'product' ? (
                                                        <td key={k}>{artist[k].title}</td>
                                                    ) : k === 'customer' ? (
                                                        <td key={k}>{artist[k].username}</td>
                                                    ) : k === 'timestamp' ? (
                                                        <td key={k}><TimeAgo isoDate={artist[k]} /></td>
                                                    ) : k === 'products' ? (
                                                        <td key={k}>{artist[k].map(ob => ob.title).join(', ')}</td>
                                                    ) : k === "image" ? (
                                                        <td key={k} className="text-center align-middle">
                                                            <div className="avatar">
                                                                <div className="w-14 rounded-xl">
                                                                    <img
                                                                        src={api.image_path + artist[k]}
                                                                        alt={artist.name}
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        <td key={k}>{artist[k]}</td>
                                                    )
                                                ))}
                                                <td>
                                                    {/* <Link to={`/artists/${artist.id}`} className="text-green-200">
                                                        <TiEdit size={30} />
                                                    </Link> */}
                                                    <button
                                                        onClick={() => deleteArtist(artist.id)}
                                                        className="text-red-600"
                                                    >
                                                        <MdDeleteForever size={30} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>

                                {/* artists Pagination Controls */}
                                <div className="flex justify-between mt-4 text-gray-100">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleArtistPrevious}
                                        disabled={artistsPagination.offset === 0}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentArtistsPage} of {Math.ceil(artistsPagination.total / artistsPagination.limit)}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleArtistNext}
                                        disabled={(artistsPagination.offset + artistsPagination.limit) >= artistsPagination.total}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Create New Artist */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab text-gray-500 text-xl font-bold" aria-label="Artist+" />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-auto">
                    <RegisterArtist />
                </div>
            </div>

        </Body>
    );
};

export default AdminPage;
