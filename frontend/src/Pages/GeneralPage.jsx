import ClothCard from "../Components/ClothCard";
import { motion } from "framer-motion";
import { useApi } from "../Contexts/ApiProvider";
// import { Link } from "react-router-dom";

const GeneralPage = ({ products }) => {
    const api = useApi();
    return (
        <div className="container mx-auto px-4 py-6">
            {products === null && (
                <span className="loading loading-ring loading-lg"></span>
            )}
            {products?.length === 0 && <p>No products to show</p>}

            <div className="grid grid-cols-1 gap-6">
                {products?.length > 0 &&
                    products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <ClothCard
                                id={product.id}
                                clothName={product.title}
                                imgSrc={api.image_path + product.subImages[0]}
                                daysLeft={product.days_left}
                                deadLine={product.deadline}
                                artist={product.artist_name}
                                expire={product.expire}
                            />
                        </motion.div>
                    ))}
            </div>
        </div>
    );
};

export default GeneralPage;
