import { MdDeleteForever } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import { useProduct } from "../Contexts/ProductProvider";
import { useState } from "react";
import { Link } from "react-router-dom";

const Tables = () => {
    const { products, pagination, fetchProducts, deleteProduct } = useProduct();
    const [currentPage, setCurrentPage] = useState(1);

    const handleNext = () => {
        if ((pagination.offset + pagination.limit) < pagination.total) {
            fetchProducts(pagination.limit, pagination.offset + pagination.limit);
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (pagination.offset > 0) {
            fetchProducts(pagination.limit, pagination.offset - pagination.limit);
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="overflow-x-auto">
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
                            <th>{index + 1 + pagination.offset}</th>
                            {Object.keys(product).map(k => (
                                <td key={k}>
                                    {k === 'mainImage' ? (
                                        <div className="avatar">
                                            <div className="w-14 rounded-xl">
                                                <img src={product[k]} alt={product.title} />
                                            </div>
                                        </div>
                                    ) : k === 'subImages' ? (
                                        <div className="avatar-group -space-x-6 rtl:space-x-reverse">
                                            {product[k]?.map((p_img, i) => (
                                                <div className="avatar" key={i}>
                                                    <div className="w-12">
                                                        <img src={p_img} alt={`SubImage ${i}`} />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content w-12">
                                                    <span>{product[k]?.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        product[k]
                                    )}
                                </td>
                            ))}
                            <td className="flex gap-4">
                                <Link className="text-green-200"><TiEdit size={30} /></Link>
                                <button onClick={() => deleteProduct(product.id)} className="text-red-600"><MdDeleteForever size={30} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4 text-gray-100">
                <button
                    className="btn btn-secondary"
                    onClick={handlePrevious}
                    disabled={pagination.offset === 0}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                    className="btn btn-secondary"
                    onClick={handleNext}
                    disabled={(pagination.offset + pagination.limit) >= pagination.total}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default Tables