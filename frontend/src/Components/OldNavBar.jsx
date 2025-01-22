import { Link } from "react-router-dom";
import { useUser } from "../Contexts/UserProvider";
import { IoMdPerson } from "react-icons/io";
import { MdDangerous, MdOutlineSettings } from "react-icons/md";
import { useState } from "react";
import { useProduct } from "../Contexts/ProductProvider";

const NavBar = ({ search, loginButton }) => {
    const [searchItem, setSearchItem] = useState("");
    const { user, adminUser, logout } = useUser();
    const { products } = useProduct();
    const [, setFilteredProducts] = useState(products);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchItem(value);
        setFilteredProducts(
            products.filter(product => product.title.toLowerCase().includes(value))
        );
    };

    const cartSize = user?.cart_size ?? 0;

    return (
        <div>
            {/* Logo */}
            <div className="absolute top-2 z-50 left-4 sm:left-8 lg:left-16 xl:left-24">
                <a href="/">
                    <img src="/images/LOGO.png" alt="Brand logo" className="h-20 w-auto rounded-full" />
                </a>
            </div>

            <div className="my-4 pb-3 sticky border-b-2 border-b-gray-20" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {/* Navbar Items */}
                <div className="flex justify-end items-center gap-0 lg:gap-4 xl:gap-16 lg:mr-8 text-xs sm:text-sm lg:text-lg xl:text-xl">
                    {/* Searchbar */}
                    {search && (
                        <div className="form-control">
                            <input
                                type="text"
                                placeholder="Search"
                                className="input input-bordered bg-black w-24 md:w-auto"
                                value={searchItem}
                                onChange={handleSearch}
                            />
                        </div>
                    )}


                    <Link to="#">
                        <span className="text-red-600 font-myriad pr-6 hover:underline hover:underline-offset-2">
                            Presale
                        </span>
                    </Link>


                    <Link to="#">
                        <span className="text-gray-100 font-myriad pr-6 hover:underline hover:underline-offset-2">
                            Archive
                        </span>
                    </Link>

                    {/* Authenticated User Features */}
                    {user && (
                        <>
                            {/* Cart */}
                            {!adminUser && <Link to="/me/carts" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <div className="indicator">
                                    <span className="badge badge-sm indicator-item">{cartSize}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </Link>}

                            {/* Avatar Dropdown */}
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            alt="User avatar"
                                            src={user ? user?.avatar : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                                        />
                                    </div>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content bg-gray-500 rounded-box mt-3 w-52 max-w-fit p-2 shadow gap-4 z-50">
                                    <Link className="flex justify-start items-end gap-4" to="">
                                        <IoMdPerson size={25} />
                                        <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">Profile</span>
                                    </Link>
                                    <Link className="flex justify-start gap-4 items-end" to="">
                                        <MdOutlineSettings size={25} />
                                        <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">Settings</span>
                                    </Link>
                                    <Link
                                        to="/"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            logout();
                                        }}
                                        className="flex justify-start gap-4 items-end">
                                        <MdDangerous size={25} className="text-red-500" />
                                        <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2 hover:text-red-500">Logout</span>
                                    </Link>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Instagram */}
                    {!user && (
                        <Link to="/">
                            <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
                                Instagram
                            </span>
                        </Link>
                    )}

                    {/* Login Button */}
                    {!user && loginButton && (
                        <Link to="/login">
                            <span className="text-green-300 font-myriad pr-6 hover:underline hover:underline-offset-2">
                                Login
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
        // <div className="flex items-center justify-between my-2 sticky top-0 z-50 font-myriad border-t-2 border-t-gray-20">
        //     {/* Logo */}
        //     <div className="flex-1 ml-8">
        //         <a href="/">
        //             <img src="/images/LOGO.png" alt="Brand logo" className="h-20 w-auto rounded-full" />
        //         </a>
        //     </div>

        //     {/* Navbar Items */}
        //     <div className="flex-none gap-8">
        //         {/* Searchbar */}
        //         {search && (
        //             <div className="form-control">
        //                 <input
        //                     type="text"
        //                     placeholder="Search"
        //                     className="input input-bordered bg-black w-24 md:w-auto"
        //                     value={searchItem}
        //                     onChange={handleSearch}
        //                 />
        //             </div>
        //         )}

        //         {/* Login Button */}
        //         {!user && loginButton && (
        //             <Link to="/login">
        //                 <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
        //                     Login
        //                 </span>
        //             </Link>
        //         )}

        //         {/* Authenticated User Features */}
        //         {user && (
        //             <>
        //                 {/* Cart */}
        //                 {!adminUser && <Link to="/me/carts" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        //                     <div className="indicator">
        //                         <span className="badge badge-sm indicator-item">{cartSize}</span>
        //                         <svg
        //                             xmlns="http://www.w3.org/2000/svg"
        //                             className="h-5 w-5"
        //                             fill="none"
        //                             viewBox="0 0 24 24"
        //                             stroke="currentColor">
        //                             <path
        //                                 strokeLinecap="round"
        //                                 strokeLinejoin="round"
        //                                 strokeWidth="2"
        //                                 d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        //                         </svg>
        //                     </div>
        //                 </Link>}

        //                 {/* Avatar Dropdown */}
        //                 <div className="dropdown dropdown-end">
        //                     <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        //                         <div className="w-10 rounded-full">
        //                             <img
        //                                 alt="User avatar"
        //                                 src={user ? user?.avatar : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
        //                             />
        //                         </div>
        //                     </div>
        //                     <ul
        //                         tabIndex={0}
        //                         className="menu menu-sm dropdown-content bg-gray-500 rounded-box z-[1] mt-3 w-52 max-w-fit p-2 shadow gap-4">
        //                         <Link className="flex justify-start items-end gap-4" to="">
        //                             <IoMdPerson size={25} />
        //                             <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">Profile</span>
        //                         </Link>
        //                         <Link className="flex justify-start gap-4 items-end" to="">
        //                             <MdOutlineSettings size={25} />
        //                             <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">Settings</span>
        //                         </Link>
        //                         <Link
        //                             to="/"
        //                             onClick={(e) => {
        //                                 e.preventDefault();
        //                                 logout();
        //                             }}
        //                             className="flex justify-start gap-4 items-end">
        //                             <MdDangerous size={25} className="text-red-500" />
        //                             <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2 hover:text-red-500">Logout</span>
        //                         </Link>
        //                     </ul>
        //                 </div>
        //             </>
        //         )}

        //         {/* Instagram */}
        //         {!user && (
        //             <Link to="/">
        //                 <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
        //                     Instagram
        //                 </span>
        //             </Link>
        //         )}
        //     </div>
        // </div>
    );
};

export default NavBar;
