import { motion } from "framer-motion";

const Carousel = ({ mainImage, subImages }) => {
    return (
        <motion.div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Main image */}
            <div className="w-full sm:w-[80%] sm:hidden">
                <img
                    className="h-auto  w-full object-cover"
                    src={mainImage}
                    alt="Main"
                />
            </div>

            {/* Thumbnails */}
            <div
                className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-[20%] sm:h-full"
                style={{ height: "auto" }}
            >
                {subImages.map((image, index) => (
                    <div
                        key={index}
                        className="flex-1 flex items-center justify-center aspect-square sm:aspect-auto sm:h-full sm:w-full overflow-hidden rounded-lg"
                    >
                        <img
                            className="w-full h-full object-cover"
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                        />
                    </div>
                ))}
            </div>
            <div className="hidden w-full sm:w-[80%] sm:block">
                <img
                    className="h-auto  w-full object-cover rounded-lg"
                    src={mainImage}
                    alt="Main"
                />
            </div>
        </motion.div>
    );
};

export default Carousel;
