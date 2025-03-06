import { useEffect, useState } from "react";
import { useApi } from "../Contexts/ApiProvider";
import { useCart } from "../Contexts/CartProvider";
import Body from "../Components/Body";

const Cart = () => {
    const { userCart, isCartLoading, totalPrice, setTotalPrice, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
    // const [currentUserCartPage, setCurrentUserCartPage] = useState(1)
    const [paymentStatusUrl, setPaymentStatusUrl] = useState();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const api = useApi();
    // const { user } = useUser();

    const [cartQuantity, setCartQuantity] = useState({});


    // const handleUserCartNext = () => {
    //     if (userCartPag.limit + userCartPag.offset < userCartPag.total) {
    //         fetchPagUserCart(userCartPag.limit, userCartPag.offset + userCartPag.limit);
    //         setCurrentUserCartPage(currentUserCartPage + 1)
    //     }
    // }

    // const handUserCartPrevious = () => {
    //     if (userCartPag.offset > 0) {
    //         fetchPagUserCart(userCartPag.limit, userCartPag.offset - userCartPag.limit);
    //         setCurrentUserCartPage(currentUserCartPage - 1);
    //     }
    // }

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
                    <div className="min-h-screen p-8 font-courier" style={{ backgroundColor: '#000' }}>
                        <div className="container mx-auto">
                            <div className="grid grid-cols-1  gap-4 border p-4 sm:mx-24 lg:mx-64">
                                <h1 className="text-3xl text-white font-extrabold font-courier text-center">Your Cart</h1>
                                {/* Cart Items */}
                                <div className="lg:col-span-2 bg-wh shadow-md rounded-lg p-6 pt-2">
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
                                                    <div className="flex items-center space-x-4 w-full gap-2 sm:gap-8 lg:gap-12">
                                                        <img
                                                            src={api.image_path + item.product.subImages[0] || "default-image.png"}
                                                            alt={item.product.title}
                                                            className="w-16 h-16 object-cover text-black"
                                                        />
                                                        <div className="flex-grow flex flex-col gap-4 justify-end">
                                                            {/* Name and button */}
                                                            <div className="flex justify-between gap-8 items-center">
                                                                <p className="font-bold text-white">{item.product.title}({item.size})</p>

                                                                {/* Remove Button */}
                                                                <button
                                                                    className="border border-gray-50 bg-transparent p-1 h-4 w-4 grid place-content-center"
                                                                    onClick={() => removeFromCart(item.id)}
                                                                >
                                                                    x
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between gap-8">
                                                                <div className="flex items-center gap-2">
                                                                    <button

                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            const cartResponse = await decrementQuantity(item.product.id);
                                                                            if (cartResponse.ok) {
                                                                                const currentItem = cartResponse.body;
                                                                                setCartQuantity((prevCounts) => (
                                                                                    {
                                                                                        ...prevCounts,
                                                                                        [item.id]: currentItem ? currentItem?.quantity : 0
                                                                                    }
                                                                                ))
                                                                                setTotalPrice(currentItem ? currentItem?.total_price : totalPrice)
                                                                            }
                                                                        }}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <p>{cartQuantity[item.id] ?? item.quantity}</p>
                                                                    <button

                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            const cartResponse = await incrementQuantity(item.product.id);
                                                                            if (cartResponse.ok) {
                                                                                const currentItem = cartResponse.body;
                                                                                setCartQuantity((prevCounts) => (
                                                                                    {
                                                                                        ...prevCounts,
                                                                                        [item.id]: currentItem ? currentItem?.quantity : 0
                                                                                    }
                                                                                ))
                                                                                setTotalPrice(currentItem ? currentItem?.total_price : totalPrice);
                                                                            }
                                                                        }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm text-white">
                                                                    {/* {item.product.price.toFixed(2)}e */}
                                                                    {item.product.price}e
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                            {/* Centered Pagination Buttons */}
                                            {/* <div className="join flex justify-center mt-4">
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
                                            </div> */}
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{totalPrice}e</span>
                                            </div>
                                            <button
                                                className="border border-gray-50 hover:text-red-500 p-1 font-courier w-full mt-6"
                                                onClick={handleOrder}
                                                disabled={userCart.length === 0 || isCheckingOut}
                                                aria-busy={isCheckingOut}
                                            >
                                                {isCheckingOut ? <progress className="progress text-slate-200"></progress> : 'Checkout'}
                                            </button>
                                        </div>

                                    )}
                                </div>

                                {/* Order Summary */}
                                {/* <div className="bg-white text-gray-600 shadow-md rounded-lg p-6">
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

                                </div> */}
                            </div>
                        </div>
                    </div>
                )}
        </Body>
    );
};

export default Cart;
