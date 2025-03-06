// import { useState } from "react";
import { motion } from "framer-motion";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
// import { useApi } from "../Contexts/ApiProvider";
import { useState } from "react";

const CarouselTest = ({ images }) => {
    // const api = useApi();
    const [startIndex, setStartIndex] = useState(0);

    const visibleImages = 3;
    const endIndex = startIndex + visibleImages;

    const handleNext = () => {
        if (endIndex < images.length) {
            setStartIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handleBack = () => {
        if (startIndex > 0) {
            setStartIndex((prevIndex) => prevIndex - 1);
        }
    };

    return (
        // <motion.div className="carousel carousel-center h-32 w-84">
        //     <div className="carousel-item">
        //         {
        //             images.map((image, index) => (
        //                 <img
        //                     key={index}
        //                     src={image}
        //                     alt={image} />
        //             ))
        //         }
        //     </div>
        // </motion.div>
        <div className="bg-black flex sm:flex-col items-center w-full h-full overflow-hidden gap-1">
            <button onClick={handleBack} disabled={startIndex === 0} className="text-white hover:cursor-pointer">
                <IoIosArrowUp size={40} />
            </button>

            <motion.div className="flex sm:flex-col justify-center overflow-hidden px-2 sm:gap-8">
                {images.slice(startIndex, endIndex).map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={img.alt || `Slide ${index + startIndex}`}
                        className="w-20 h-35 object-cover mx-1"
                    />
                ))}
            </motion.div>

            <button onClick={handleNext} disabled={endIndex >= images.length} className="text-white hover:cursor-pointer">
                <IoIosArrowDown size={40} />
            </button>
        </div>
    );
};

export default CarouselTest;