// import { TiShoppingCart } from "react-icons/ti";
import ProgressBar from './ProgressBar';
import Body from './Body';
import Carousel from './Carousel';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProduct } from '../Contexts/ProductProvider';
import { useCart } from "../Contexts/CartProvider";
import { useUser } from "../Contexts/UserProvider";
import { useFlash } from '../Contexts/FlashProvider';

const Sale = () => {
    const { id } = useParams();
    const flash = useFlash()

    const { fetchProduct } = useProduct();
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const { addToCart } = useCart();
    const { user } = useUser();
    const { userCart } = useCart();
    const navigate = useNavigate()

    const [, setProductCountInCart] = useState(0);
    // const [productCountInCart, setProductCountInCart] = useState(0);

    const handleSize = (e) => {
        e.preventDefault();
        setSelectedSize(e.target.textContent)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch product data
                const productData = await fetchProduct(id);
                if (productData) {
                    setProductCountInCart(productData?.quantity_in_cart);
                } else {
                    setProductCountInCart(0);
                }


                // Enhance product data
                const edited = {
                    ...productData,
                    mainImage: productData.mainImage || '/image3.jpg',
                    subImages: productData.subImages || Array(4).fill('/defaultcloth.jpg'),
                    // mainImage: '/image3.jpg',
                    // subImages: Array(4).fill('/defaultcloth.jpg'),
                };

                setApiData(edited);
            } catch (error) {
                console.error("Error fetching product data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, fetchProduct, userCart]);



    if (loading) {
        return (
            <Body>
                <span className="loading loading-ring loading-lg"></span>
            </Body>
        );
    }

    return (
        <Body>
            <div className="bg-inherit mt-4">
                <div className="lg:m-10 border border-gray-100 p-4 flex flex-col lg:flex-row gap-2 items-center sm:items-start justify-between lg:mx-16 xl:mx-32">
                    {/* Title and Artist name for iphone screens */}
                    <div className='flex flex-col justify-center items-center sm:hidden font-courier'>
                        <p className='font-extrabold whitespace-nowrap text-xl'>
                            {apiData.title}
                        </p>
                        <p className='font-extrabold text-xl whitespace-nowrap'>X</p>
                        <p className='font-extrabold text-xl whitespace-nowrap'>{apiData.artist_name}</p>
                    </div>

                    {/* Image, Carousel, and progress */}
                    <div className="flex-grow flex flex-col w-full gap-4">
                        {/* Image and Carousel */}
                        <Carousel
                            mainImage={apiData.mainImage} subImages={apiData.subImages} />

                        {/* Details on iphone */}
                        <p className='sm:hidden font-courier'>{apiData.artist_details?.length >= 60 ? <>{apiData.artist_details.slice(0, 60)}
                            <label htmlFor="moreDetails" className="bg-gray-600 ml-4">more...</label>
                        </> : (apiData.artist_details || "Details not available")}</p>

                        {/* Preorder deadline on iphone screen */}
                        {apiData.days_left > 0 && !apiData.expire &&
                            <p className="text-center text-gray-100 font-extrabold font-courier sm:hidden">
                                Pre-order only {apiData.deadline} days
                            </p>}

                        {/* Progress */}
                        {apiData.days_left > 0 && !apiData.expire &&
                            <div className="flex flex-col">
                                <p className="flex justify-end sm:justify-between text-gray-100 text-sm">
                                    <span className='hidden sm:flex sm:flex-grow max-w-[50%]'>
                                        <span>
                                            Pre-order only {apiData.deadline} days
                                        </span>
                                    </span>
                                    <span
                                        className="flex flex-grow max-w-[50%] justify-end"
                                        style={{ paddingRight: `${apiData.days_left}px` }}
                                    >
                                        <span>-{apiData.days_left} Days</span>
                                    </span>
                                </p>
                                <ProgressBar daysLeft={apiData.days_left} deadLine={apiData.deadline} />
                            </div>}
                    </div>
                    {/* Details */}
                    <div className="sm:mx-9 lg:w-[30%] lg:flex lg:flex-col justify-start font-courier text-ellipsis">

                        {/* Name and Artist for small screens upward*/}
                        <div className='hidden sm:flex sm:flex-col md:flex-row lg:flex-col justify-center items-center lg:gap-1 mb-4'>
                            <p className='font-bold whitespace-nowrap lg:text-lg'>
                                {apiData.title}
                            </p>
                            <p className='font-bold lg:text-lg'>X</p>
                            <p className='font-bold lg:text-lg whitespace-nowrap'>{apiData.artist_name}</p>
                        </div>

                        {/* Details*/}
                        <p className='hidden sm:block sm:mb-4'>{apiData.artist_details?.length >= 80 ? <>{apiData.artist_details.slice(0, 80)}
                            <label htmlFor="moreDetails" className="bg-gray-600 ml-4">more...</label>
                        </> : (apiData.artist_details || "Details not available")}</p>

                        {/* Website */}
                        <p className='font-bold text-base mb-4'>{apiData.artist_website}</p>
                        {!apiData.expire ? <>
                            {/* Composition */}
                            <p className='text-base mb-2'>Composition: {apiData.composition}</p>
                            {/* Color */}
                            <p className='text-base mb-2'>Color: {apiData.color}</p>
                            {/* Price */}
                            <p className='mb-4 text-base'>Price: {apiData.price} €</p>
                            {/* Size Guide */}
                            <p className='font-bold text-base my-2'>Size guide +</p>
                            {/* Sizes */}
                            <p className='my-2'>SIZE</p>
                            <div className='flex gap-4'>
                                {apiData?.sizes?.map((size) => (
                                    <button
                                        key={size}
                                        onClick={handleSize}
                                        className={`bg-white py-1 px-2 text-lg text-black font-extrabold w-8 min-w-fit grid place-content-center border-2 transition-all ${selectedSize === size ? "border-red-700 scale-105" : "border-gray-300"
                                            }`}
                                    >
                                        {size.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Quantity */}
                            <p className='my-2'>Quantity</p>
                            <p className='bg-white py-1 px-2 text-lg text-black font-extrabold w-8 min-w-fit grid place-content-center'>
                                1
                            </p>

                            {/* <button
                                className="relative btn my-4 min-w-fit flex items-center gap-2 flex-nowrap"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const cartResponse = await addToCart(apiData.id);
                                    if (cartResponse.ok) {
                                        const cartItem = cartResponse.body;
                                        const count = cartItem ? cartItem.quantity : 0;
                                        setProductCountInCart(count);
                                    }
                                }}
                                disabled={!apiData || !user || apiData.quantity === 0}
                            >
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {productCountInCart}
                                </span>
                                <TiShoppingCart size={30} />
                                <span className="whitespace-nowrap">Add to Cart</span>
                            </button> */}
                            <button
                                className="border border-gray-200 hover:text-red-500 my-4 w-fit px-4 py-2"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (!user) {
                                        // const url = location.pathname + location.search + location.hash;
                                        flash('Please login first!')
                                        navigate("/login");
                                        return;
                                    } else if (selectedSize === '') {
                                        flash('Please pick a size first!')
                                        return
                                    } else {
                                        console.log("Selected Sizes: " + selectedSize)
                                        const cartResponse = await addToCart(apiData.id, selectedSize);
                                        if (cartResponse.ok) {
                                            const cartItem = cartResponse.body;
                                            const count = cartItem ? cartItem.quantity : 0;
                                            setProductCountInCart(count);
                                        }
                                    }
                                }}
                                disabled={!apiData || apiData.quantity === 0}
                            >
                                PRE-ORDER
                            </button>


                            <p>Shipping in approximately 4 weeks after the end of the sale.</p>
                        </> :
                            <p className="text-red-600 font-extrabold font-courier text-xl">Sales has ended</p>
                        }

                    </div>
                </div>
            </div>
            {/* Put this part before </body> tag */}
            <input type="checkbox" id="moreDetails" className="modal-toggle" />
            <div className="modal" role="dialog">
                <div className="modal-box bg-black">
                    <h3 className="text-lg font-bold">Detail about {apiData.artist_name}</h3>
                    <p className="py-4">{apiData.artist_details}</p>
                    <div className="modal-action">
                        <label htmlFor="moreDetails" className="btn">Close!</label>
                    </div>
                </div>
            </div>
        </Body>
    );
};

export default Sale;
