import { useEffect, useState } from "react";
import { useApi } from "../Contexts/ApiProvider";
import { useCart } from "../Contexts/CartProvider";
import Body from "../Components/Body";

const Cart = () => {
    const { userCart, isCartLoading, totalPrice, removeFromCart, userCartPag, fetchPagUserCart } = useCart();
    const [currentUserCartPage, setCurrentUserCartPage] = useState(1)
    const [paymentStatusUrl, setPaymentStatusUrl] = useState();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const api = useApi();


    const handleUserCartNext = () => {
        if (userCartPag.limit + userCartPag.offset < userCartPag.total) {
            fetchPagUserCart(userCartPag.limit, userCartPag.offset + userCartPag.limit);
            setCurrentUserCartPage(currentUserCartPage + 1)
        }
    }

    const handUserCartPrevious = () => {
        if (userCartPag.offset > 0) {
            fetchPagUserCart(userCartPag.limit, userCartPag.offset - userCartPag.limit);
            setCurrentUserCartPage(currentUserCartPage - 1);
        }
    }

    useEffect(() => {
        if (paymentStatusUrl) {
            window.location.href = paymentStatusUrl;
        }
    }, [paymentStatusUrl]);


    const handleOrder = async (e) => {
        e.preventDefault();
        setIsCheckingOut(true);
        try {
            const response = await api.post(`/create-checkout-session`);
            if (response.ok) {
                const { session_url: paymentStatusUrl } = response.body; // Adjust based on response structure
                console.log(paymentStatusUrl)
                setPaymentStatusUrl(paymentStatusUrl);
            } else {
                const { cancel_url: paymentStatusUrl } = response.body; // Adjust based on response structure
                console.log(paymentStatusUrl)
                setPaymentStatusUrl(paymentStatusUrl);
            }
        } catch (error) {
            console.error("Error creating Stripe session:", error);
            alert("Something went wrong! Please try again.");
        }
        setIsCheckingOut(false);
    };


    return (
        <Body>
            {isCartLoading ? (<span className="loading loading-ring loading-lg"></span>) : userCart?.length === 0 ?
                (<p className="text-center text-gray-500">Your cart is empty.</p>) : (
                    <div className="bg-gray-100 min-h-screen p-8">
                        <div className="container mx-auto">
                            <h1 className="text-3xl text-gray-500 font-extrabold mb-6 text-center">Your Cart</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cart Items */}
                                <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
                                    {userCart.length === 0 ? (
                                        <p className="text-center text-gray-500">Your cart is empty.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {userCart.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between border-b py-4"
                                                >
                                                    {/* Item Info */}
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={api.image_path + item.product.mainImage || "default-image.png"}
                                                            alt={item.product.title}
                                                            className="w-16 h-16 object-cover rounded text-black"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-600">{item.product.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Quantity: {item.quantity}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Price: ${item.product.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        className="btn btn-error btn-sm"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            {/* Centered Pagination Buttons */}
                                            <div className="join flex justify-center mt-4">
                                                <button
                                                    className="join-item btn"
                                                    onClick={handUserCartPrevious}
                                                    disabled={userCartPag.offset === 0}
                                                >
                                                    Prev
                                                </button>
                                                <button className="join-item btn">
                                                    <span>
                                                        Page {currentUserCartPage} of {Math.ceil(userCartPag.total / userCartPag.limit)}
                                                    </span>
                                                </button>
                                                <button
                                                    className="join-item btn"
                                                    onClick={handleUserCartNext}
                                                    disabled={(userCartPag.offset + userCartPag.limit) >= userCartPag.total}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>

                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white text-gray-600 shadow-md rounded-lg p-6">
                                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-bold">${totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-bold">Free</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-bold">${(totalPrice * 0.1).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <hr className="my-4" />
                                    <div className="flex justify-between">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-xl font-bold">
                                            ${(totalPrice + totalPrice * 0.1).toFixed(2) || 0}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-primary w-full mt-6"
                                        onClick={handleOrder}
                                        disabled={userCart.length === 0 || isCheckingOut}
                                        aria-busy={isCheckingOut}
                                    >
                                        {isCheckingOut ? <progress className="progress text-slate-200"></progress> : 'Checkout'}
                                    </button>
                                    {/* <form action="http://localhost:4242/api/create-checkout-session" method="POST">
                                    <button type="submit" id="checkout-button" className="btn btn-primary w-full mt-6">Checkout</button>
                                </form> */}

                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </Body>
    );
};

export default Cart;
