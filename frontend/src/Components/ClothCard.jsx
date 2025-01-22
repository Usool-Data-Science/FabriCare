import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

const ClothCard = ({ id, imgSrc, clothName, deadLine, daysLeft, artist }) => {
    return (
        <div className="bg-inherit border-2 border-gray-500 p-4 font-courier flex flex-col sm:flex-row gap-8">
            {/* Image */}
            <div className="w-full md:w-[20%] flex justify-center items-center">
                <img className="w-full h-auto max-h-52 object-cover" src={imgSrc} alt={clothName.slice(0, 5)} />
            </div>

            {/* Details */}
            <div className="flex flex-col flex-grow gap-4 justify-center">
                {/* Name and button */}
                <div className="flex justify-between items-center gap-8">
                    <p className="text-gray-100 text-xl sm:text-2xl truncate">{clothName} X <span className="truncate">{artist}</span></p>
                    <Link
                        to={`/sales/${id}`}
                        className="hidden sm:block border-2 border-gray-100 py-1 px-3 text-gray-100 text-xs sm:text-sm lg:text-lg hover:bg-gray-500 whitespace-nowrap"
                    >
                        View sale
                    </Link>
                </div>

                {/* Preorder stand alone on extra small screen */}
                <p className="sm:hidden self-center tx-xs">Pre-order only {deadLine} days</p>
                {/* Progress bar */}
                <div>
                    <p className="flex justify-end sm:justify-between text-gray-100 text-xs gap-8 sm:pt-12">
                        <span className="hidden sm:block">- Pre-order only {deadLine} days</span>
                        <span>- {daysLeft} Days Left</span>
                    </p>
                    <ProgressBar daysLeft={daysLeft} deadLine={deadLine} />
                </div>
                {/* Standalone sales button */}
                <Link
                    to={`/sales/${id}`}
                    className="sm:hidden border-2 border-gray-100 py-1 px-3 text-gray-100 text-xs sm:text-sm lg:text-lg text-center hover:bg-gray-500 whitespace-nowrap"
                >
                    View sale
                </Link>
            </div>
        </div>
    );
};

export default ClothCard;
