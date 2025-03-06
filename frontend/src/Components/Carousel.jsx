import { motion } from "framer-motion";
import { useApi } from "../Contexts/ApiProvider";
import { useState } from "react";

const Carousel = ({ subImages }) => {
    const api = useApi();
    const [selectedImage, setSelectedImage] = useState(subImages[0]);
    const [startIndex, setStartIndex] = useState(0);
    const visibleImages = 3;
    const endIndex = startIndex + visibleImages;

    const handleNext = () => {
        if (endIndex < subImages.length) {
            setStartIndex(prevStartIndex => prevStartIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (startIndex > 0) {
            setStartIndex(prevStartIndex => prevStartIndex - 1);
        }
    };

    return (
        <motion.div className="flex flex-col sm:flex-row sm:w-full items-center gap-4">
            {/* Main image for smaller screens */}
            <div className="w-full sm:hidden">
                <img
                    className="h-auto w-full object-cover"
                    src={api.image_path + selectedImage}
                    alt="Main"
                />
            </div>

            {/* Thumbnails for smaller screens */}
            <div className="sm:hidden flex items-center gap-1 w-full" style={{ height: '80px' }}>
                <button className="w-[5%]" onClick={handlePrevious} disabled={startIndex === 0}>
                    <img src="/images/arrowLeft.jpg" className="h-auto w-full" />
                </button>
                <motion.div className="h-full w-[90%] flex justify-center overflow-hidden">
                    {subImages.slice(startIndex, endIndex).map((img, index) => (
                        <img
                            key={index}
                            src={api.image_path + img}
                            alt={`Slide ${index + startIndex}`}
                            className="w-[33%] h-auto object-cover mx-1 cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                        />
                    ))}
                </motion.div>
                <button className="w-[5%]" onClick={handleNext} disabled={endIndex >= subImages.length}>
                    <img src="/images/arrowRight.jpg" className="h-auto w-full" />
                </button>
            </div>

            {/* Thumbnails for larger screens */}
            <div className="hidden sm:flex sm:flex-col sm:w-[20%] sm:items-center" style={{ height: "578px" }}>
                <button style={{ height: "19px", width: "38px" }} onClick={handlePrevious} disabled={startIndex === 0}>
                    <img src="/images/arrowUp.jpg" style={{ height: "19px", width: "38px" }} />
                </button>
                <motion.div className="h-[95%] mt-2 flex sm:flex-col justify-center overflow-hidden sm:gap-2 w-full">
                    {subImages.slice(startIndex, endIndex).map((img, index) => (
                        <img
                            key={index}
                            src={api.image_path + img}
                            alt={`Slide ${index + startIndex}`}
                            className="h-[33%] w-full object-cover cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                        />
                    ))}
                </motion.div>
                <button className="pt-2" style={{ height: "19px", width: "38px" }} onClick={handleNext} disabled={endIndex >= subImages.length}>
                    <img src="/images/arrowDown.jpg" style={{ height: "19px", width: "38px" }} />
                </button>
            </div>

            {/* Main image for larger screens */}
            <div className="hidden sm:w-[80%] sm:block">
                <img
                    className="h-auto w-full pt-2 object-cover"
                    style={{ height: "540px" }}
                    src={api.image_path + selectedImage}
                    alt="Main image"
                />
            </div>
        </motion.div>
    );
};

export default Carousel;
