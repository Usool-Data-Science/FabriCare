import { IoEnterOutline, IoPersonOutline } from "react-icons/io5";
import { SlBag } from "react-icons/sl";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../Contexts/UserProvider";
import { IoMdPerson } from "react-icons/io";
import { MdDangerous } from "react-icons/md";
import { useState } from "react";
import { useProduct } from "../Contexts/ProductProvider";

const NavBar = ({ search, loginButton }) => {
    const [searchItem, setSearchItem] = useState("");
    const { user, adminUser, logout } = useUser();
    const { products } = useProduct();
    const [, setFilteredProducts] = useState(products);
    const location = useLocation();

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchItem(value);
        setFilteredProducts(
            products.filter(product => product.title.toLowerCase().includes(value))
        );
    };

    const cartSize = user?.cart_size ?? 0;

    return (
        <nav className="fixed top-0 left-0 w-full bg-black text-gray-100 shadow-md z-50 pt-2 px-2 sm:px-6 gap-8 flex justify-between items-center border-b border-gray-700">
            {/* Logo */}
            <Link to="/landing" className="flex items-center">
                <img src="/images/Fabricare.png" alt="Brand logo" className="h-14 sm:h-16 w-auto rounded-lg" />
            </Link>

            <div className="">
                {/* Navbar Items */}
                <div className={`flex justify-end items-baseline space-x-2 sm:space-x-8 lg:space-x-10 xl:space-x-12 ${user ? "" : "mr-4"} sm:mr-4 lg:mr-8 text-xs sm:text-sm lg:text-lg xl:text-xl font-courier`}>
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

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-10 xl:space-x-12">
                        <Link to="/">
                            <span className={`text-sm sm:text-lg font-courier hover:underline hover:underline-offset-2
                ${location.pathname === "/" || location.pathname === "/home" ? 'text-red-600' : 'text-gray-100'}`}>
                                Presale
                            </span>
                        </Link>
                        <Link to="/collaboration">
                            <span className={`text-sm sm:text-lg font-courier hover:underline hover:underline-offset-2
                ${location.pathname === "/collaboration" ? 'text-red-600' : 'text-gray-100'}`}>
                                Archive
                            </span>
                        </Link>
                    </div>

                    {/* Authenticated User Features */}
                    {user ? (
                        <>
                            {!adminUser && (
                                <a href="/me/carts" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                    <div className="indicator">
                                        <span className="badge badge-sm indicator-item">{cartSize}</span>
                                        <SlBag className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                    </div>
                                </a>
                            )}

                            {/* Avatar Dropdown */}
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <IoPersonOutline className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                </div>
                                <ul className="menu menu-sm dropdown-content border border-gray-50 m-3 w-52 max-w-fit p-2 gap-4 z-100 bg-black">
                                    <Link className="flex justify-start items-end gap-4" to="">
                                        <IoMdPerson className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                        <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
                                            Profile
                                        </span>
                                    </Link>
                                    <Link to="/landing" onClick={(e) => { e.preventDefault(); logout(); }} className="flex justify-start gap-4 items-end">
                                        <MdDangerous className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-gray-50" />
                                        <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2 hover:text-red-500">
                                            Logout
                                        </span>
                                    </Link>
                                </ul>
                            </div>
                        </>
                    ) : (
                        loginButton && (
                            <>
                                {!adminUser && (
                                    <a href="/me/carts" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                        <div className="indicator">
                                            {/* <span className="badge badge-sm indicator-item">{cartSize}</span> */}
                                            <SlBag className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                        </div>
                                    </a>
                                )}

                                {/* Avatar Dropdown */}
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                        <IoPersonOutline className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                    </div>
                                    <ul className="menu menu-sm dropdown-content border border-gray-50 m-3 w-52 max-w-fit p-2 gap-4 z-100 bg-black">
                                        <Link className="flex justify-start items-end gap-4" to="">
                                            <IoMdPerson className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                                            <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
                                                Profile
                                            </span>
                                        </Link>
                                        <Link to="/login" className="flex justify-start gap-4 items-end">
                                            <IoEnterOutline className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-gray-50" />
                                            <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2 hover:text-green-500">
                                                Login
                                            </span>
                                        </Link>
                                    </ul>
                                </div>
                            </>
                        )
                    )}
                </div>

            </div>
        </nav>
    );
};

export default NavBar;
