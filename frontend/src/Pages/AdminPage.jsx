import { FcExpired } from "react-icons/fc";
import { MdDeleteForever, MdTimelapse } from "react-icons/md";
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
    const { products, productPagination, fetchPaginatedProducts, deleteProduct, deleteAllProducts, expireAllProducts, expireProduct } = useProduct();
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

                    {/* Delete & Expire all products buttons */}
                    <div className="flex gap-4 mb-4">
                        <button onClick={deleteAllProducts} className="btn bg-red-500 hover:bg-red-300 transition-all duration-300 text-gray-50 flex items-center gap-2">
                            <MdDeleteForever size={25} /> Delete All
                        </button>
                        <button onClick={expireAllProducts} className="btn bg-red-800 hover:bg-red-300 transition-all duration-300 text-gray-50 flex items-center gap-2">
                            <FcExpired size={25} /> Expire All
                        </button>
                    </div>

                    {products === null && <span className="loading loading-ring loading-lg"></span>}
                    {products?.length === 0 && <p className="pt-8 text-center text-3xl font-courier">No products to display!</p>}

                    {products?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-700">

                                {/* Table head */}
                                <thead className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-2 border border-gray-700 text-center">#</th>
                                        {Object.keys(products[0]).map(k => (
                                            <th key={k} className="p-2 border border-gray-700 text-center">{k.replace('_', ' ')}</th>
                                        ))}
                                        <th className="p-2 border border-gray-700 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {/* Table body */}
                                <tbody className="text-gray-300 text-sm">
                                    {products.map((product, index) => (
                                        <tr key={product.id} className={`border border-gray-700 ${product.expire ? 'bg-gray-500' : 'bg-gray-900'}`}>

                                            {/* Serial Number */}
                                            <td className="p-2 text-center">{index + 1 + productPagination.offset}</td>

                                            {Object.keys(product).map(k => (
                                                <td key={k} className="p-2 border border-gray-700 text-center max-w-[200px] truncate">
                                                    {k === "mainImage" ? (
                                                        <div className="avatar mx-auto">
                                                            <div className="w-14 rounded-xl">
                                                                <img src={api.image_path + product[k]} alt={product.title} className="object-cover" />
                                                            </div>
                                                        </div>
                                                    ) : k === "subImages" ? (
                                                        <div className="flex justify-center gap-1">
                                                            {product[k]?.slice(0, 3).map((p_img, i) => (
                                                                <img key={i} src={api.image_path + p_img} alt={`SubImage ${i}`} className="w-10 h-10 object-cover rounded-lg border" />
                                                            ))}
                                                            {product[k]?.length > 3 && <span className="text-xs">+{product[k].length - 3}</span>}
                                                        </div>
                                                    ) : k === "first_seen" || k === "last_seen" ? (
                                                        <TimeAgo isoDate={product[k]} />
                                                    ) : k === "sizes" ? (
                                                        <span className="truncate">{product[k].join(", ")}</span>
                                                    ) : (
                                                        <span className="truncate">{product[k]}</span>
                                                    )}
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="p-2 border border-gray-700 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Link to={`/products/${product.id}`} className="text-green-400 hover:text-green-600">
                                                        <TiEdit size={25} />
                                                    </Link>
                                                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                                                        <MdDeleteForever size={25} />
                                                    </button>
                                                    <button onClick={() => expireProduct(product.id, product.title)} className="text-yellow-500 hover:text-yellow-700">
                                                        <MdTimelapse size={25} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 text-gray-200">
                                <button className="btn btn-secondary" onClick={handleProductPrevious} disabled={productPagination.offset === 0}>
                                    Previous
                                </button>
                                <span className="text-lg font-semibold">
                                    Page {currentProductPage} of {Math.ceil(productPagination.total / productPagination.limit)}
                                </span>
                                <button className="btn btn-secondary" onClick={handleProductNext} disabled={(productPagination.offset + productPagination.limit) >= productPagination.total}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Customer Tab */}
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab text-gray-500 text-xl font-bold"
                    aria-label="Customers"
                />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-x-auto">

                    {/* Loading and Empty State */}
                    {allUsers === null && <span className="loading loading-ring loading-lg"></span>}
                    {allUsers?.length === 0 && <p className="pt-8 text-center text-3xl font-courier">No users to display!</p>}

                    {allUsers?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-700">

                                {/* Table Head */}
                                <thead className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-2 border border-gray-700 text-center">#</th>
                                        {Object.keys(allUsers[0]).map((k) => (
                                            <th key={k} className="p-2 border border-gray-700 text-center">
                                                {k.replace('_', ' ')}
                                            </th>
                                        ))}
                                        <th className="p-2 border border-gray-700 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="text-gray-300 text-sm">
                                    {allUsers.map((user, index) => (
                                        <tr key={user.username} className="border border-gray-700 bg-gray-900">

                                            {/* Serial Number */}
                                            <td className="p-2 text-center">{index + 1 + userPagination.offset}</td>

                                            {Object.keys(user).map((k) => (
                                                <td key={k} className="p-2 border border-gray-700 text-center max-w-[200px] truncate">
                                                    {k === "first_seen" || k === "last_seen" ? (
                                                        <TimeAgo isoDate={user[k]} />
                                                    ) : (
                                                        <span className="truncate">{user[k]}</span>
                                                    )}
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="p-2 border border-gray-700 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {/* Uncomment if edit functionality is needed */}
                                                    {/* <Link to={`/users/${user.username}`} className="text-green-400 hover:text-green-600">
                                        <TiEdit size={25} />
                                    </Link> */}
                                                    <button onClick={() => deleteUser(user.username, user.id)} className="text-red-500 hover:text-red-700">
                                                        <MdDeleteForever size={25} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* User Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 text-gray-200">
                                <button className="btn btn-secondary" onClick={handleUserPrevious} disabled={userPagination.offset === 0}>
                                    Previous
                                </button>
                                <span className="text-lg font-semibold">
                                    Page {currentUserPage} of {Math.ceil(userPagination.total / userPagination.limit)}
                                </span>
                                <button className="btn btn-secondary" onClick={handleUserNext} disabled={(userPagination.offset + userPagination.limit) >= userPagination.total}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                {/* Carts Tab */}
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab text-gray-500 text-xl font-bold"
                    aria-label="Carts"
                />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-x-auto">

                    {/* Loading and Empty State */}
                    {carts === null && <span className="loading loading-ring loading-lg"></span>}
                    {carts?.length === 0 && <p className="pt-8 text-center text-3xl font-courier">No carts to display!</p>}

                    {carts?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-700">

                                {/* Table Head */}
                                <thead className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-2 border border-gray-700 text-center">#</th>
                                        {Object.keys(carts[0]).map((k) => (
                                            <th key={k} className="p-2 border border-gray-700 text-center">
                                                {k.replace('_', ' ')}
                                            </th>
                                        ))}
                                        <th className="p-2 border border-gray-700 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="text-gray-300 text-sm">
                                    {carts.map((cart, index) => (
                                        <tr key={cart.id} className="border border-gray-700 bg-gray-900">

                                            {/* Serial Number */}
                                            <td className="p-2 text-center">{index + 1 + cartsPagination.offset}</td>

                                            {Object.keys(cart).map((k) => (
                                                <td key={k} className="p-2 border border-gray-700 text-center max-w-[200px] truncate">
                                                    {k === "product" ? (
                                                        <span>{cart[k].title}</span>
                                                    ) : k === "customer" ? (
                                                        <span>{cart[k].username}</span>
                                                    ) : k === "first_seen" || k === "last_seen" ? (
                                                        <TimeAgo isoDate={cart[k]} />
                                                    ) : (
                                                        <span className="truncate">{cart[k]}</span>
                                                    )}
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="p-2 border border-gray-700 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {/* Uncomment if edit functionality is needed */}
                                                    {/* <Link to={`/carts/${cart.id}`} className="text-green-400 hover:text-green-600">
                                        <TiEdit size={25} />
                                    </Link> */}
                                                    <button onClick={() => deleteCart(cart.id)} className="text-red-500 hover:text-red-700">
                                                        <MdDeleteForever size={25} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* Carts Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 text-gray-200">
                                <button className="btn btn-secondary" onClick={handleCartsPrevious} disabled={cartsPagination.offset === 0}>
                                    Previous
                                </button>
                                <span className="text-lg font-semibold">
                                    Page {currentCartsPage} of {Math.ceil(cartsPagination.total / cartsPagination.limit)}
                                </span>
                                <button className="btn btn-secondary" onClick={handleCartsNext} disabled={(cartsPagination.offset + cartsPagination.limit) >= cartsPagination.total}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders Tab */}
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab text-gray-500 text-xl font-bold"
                    aria-label="Orders"
                />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-x-auto">

                    {/* Loading and Empty State */}
                    {orders === null && <span className="loading loading-ring loading-lg"></span>}
                    {orders?.length === 0 && <p className="pt-8 text-center text-3xl font-courier">No orders to display!</p>}

                    {orders?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-700">

                                {/* Table Head */}
                                <thead className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-2 border border-gray-700 text-center">#</th>
                                        {Object.keys(orders[0]).map((k) => (
                                            <th key={k} className="p-2 border border-gray-700 text-center">
                                                {k.replace('_', ' ')}
                                            </th>
                                        ))}
                                        <th className="p-2 border border-gray-700 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="text-gray-300 text-sm">
                                    {orders.map((order, index) => (
                                        <tr key={order.id} className="border border-gray-700 bg-gray-900">

                                            {/* Serial Number */}
                                            <td className="p-2 text-center">{index + 1 + ordersPagination.offset}</td>

                                            {Object.keys(order).map((k) => (
                                                <td key={k} className="p-2 border border-gray-700 text-center max-w-[200px] truncate">
                                                    {k === "product" ? (
                                                        <span>{order[k].title}</span>
                                                    ) : k === "customer" ? (
                                                        <span>{order[k].username}</span>
                                                    ) : k === "timestamp" ? (
                                                        <TimeAgo isoDate={order[k]} />
                                                    ) : k === "products" ? (
                                                        <span>{order[k].map(ob => ob.title).join(', ')}</span>
                                                    ) : (
                                                        <span className="truncate">{order[k]}</span>
                                                    )}
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="p-2 border border-gray-700 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-700">
                                                        <MdDeleteForever size={25} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* Orders Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 text-gray-200">
                                <button className="btn btn-secondary" onClick={handleOrderPrevious} disabled={ordersPagination.offset === 0}>
                                    Previous
                                </button>
                                <span className="text-lg font-semibold">
                                    Page {currentOrdersPage} of {Math.ceil(ordersPagination.total / ordersPagination.limit)}
                                </span>
                                <button className="btn btn-secondary" onClick={handleOrderNext} disabled={(ordersPagination.offset + ordersPagination.limit) >= ordersPagination.total}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Artists Tab */}
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab text-gray-500 text-xl font-bold"
                    aria-label="Artists"
                />
                <div role="tabpanel" className="tab-content border-base-300 rounded-box p-6 overflow-x-auto">

                    {/* Loading and Empty State */}
                    {artists === null && <span className="loading loading-ring loading-lg"></span>}
                    {artists?.length === 0 && <p className="pt-8 text-center text-3xl font-courier">No artists to display!</p>}

                    {artists?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-700">

                                {/* Table Head */}
                                <thead className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-2 border border-gray-700 text-center">#</th>
                                        {Object.keys(artists[0]).map((k) => (
                                            <th key={k} className="p-2 border border-gray-700 text-center">
                                                {k.replace('_', ' ')}
                                            </th>
                                        ))}
                                        <th className="p-2 border border-gray-700 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="text-gray-300 text-sm">
                                    {artists.map((artist, index) => (
                                        <tr key={artist.id} className={`border border-gray-700 ${artist.expire ? 'bg-gray-500' : 'bg-gray-900'}`}>

                                            {/* Serial Number */}
                                            <td className="p-2 text-center">{index + 1 + artistsPagination.offset}</td>

                                            {Object.keys(artist).map((k) => (
                                                <td key={k} className="p-2 border border-gray-700 text-center max-w-[200px] truncate">
                                                    {k === "product" ? (
                                                        <span>{artist[k].title}</span>
                                                    ) : k === "customer" ? (
                                                        <span>{artist[k].username}</span>
                                                    ) : k === "timestamp" ? (
                                                        <TimeAgo isoDate={artist[k]} />
                                                    ) : k === "products" ? (
                                                        <span>{artist[k].map(ob => ob.title).join(', ')}</span>
                                                    ) : k === "image" ? (
                                                        <div className="avatar mx-auto">
                                                            <div className="w-14 rounded-xl">
                                                                <img
                                                                    src={api.image_path + artist[k]}
                                                                    alt={artist.name}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="truncate">{artist[k]}</span>
                                                    )}
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="p-2 border border-gray-700 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => deleteArtist(artist.id)} className="text-red-500 hover:text-red-700">
                                                        <MdDeleteForever size={25} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* Artists Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 text-gray-200">
                                <button className="btn btn-secondary" onClick={handleArtistPrevious} disabled={artistsPagination.offset === 0}>
                                    Previous
                                </button>
                                <span className="text-lg font-semibold">
                                    Page {currentArtistsPage} of {Math.ceil(artistsPagination.total / artistsPagination.limit)}
                                </span>
                                <button className="btn btn-secondary" onClick={handleArtistNext} disabled={(artistsPagination.offset + artistsPagination.limit) >= artistsPagination.total}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
