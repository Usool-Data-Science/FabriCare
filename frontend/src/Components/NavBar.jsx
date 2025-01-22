import { IoPersonOutline } from "react-icons/io5";
import { SlBag } from "react-icons/sl";
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
        <div className="mb-4">
            {/* Logo */}
            <div className="absolute top-1 sm:top-2 lg:top-3 xl:top-5 z-50 left-4 sm:left-8 lg:left-16 xl:left-24">
                <a href="/">
                    <img src="/images/Fabricare.png" alt="Brand logo" className="h-15 w-32 rounded-full" />
                </a>
            </div>

            <div className="mb-4 sticky border-b-4 border-b-gray-20">
                {/* Navbar Items */}
                <div className="flex justify-end items-center gap-4 xl:gap-16 mr-4 lg:mr-8 text-xs sm:text-sm lg:text-lg xl:text-xl font-courier">
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

                    <div className="flex gap-4 pt-3">
                        <Link to="#">
                            <span className="text-red-600 text-sm font-courier hover:underline hover:underline-offset-2">
                                Presale
                            </span>
                        </Link>


                        <Link to="#">
                            <span className="text-gray-100 text-sm font-courier hover:underline hover:underline-offset-2">
                                Archive
                            </span>
                        </Link>
                    </div>

                    {/* Authenticated User Features */}
                    {user && (
                        <div className="flex">
                            {/* Cart */}
                            {!adminUser && <Link to="/me/carts" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <div className="indicator">
                                    <span className="badge badge-sm indicator-item">{cartSize}</span>
                                    <SlBag size={25} />
                                </div>
                            </Link>}

                            {/* Avatar Dropdown */}
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <IoPersonOutline size={25} />
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
                        </div>
                    )}

                    {/*                     
                    {!user && (
                        <Link to="/">
                            <span className="text-gray-100 font-arvo pr-6 hover:underline hover:underline-offset-2">
                                Instagram
                            </span>
                        </Link>
                    )} */}

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
    );
};

export default NavBar;
