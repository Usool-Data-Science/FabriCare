const ProgressBar = ({ daysLeft, deadLine }) => {
    return (

        <div style={{ height: '2px' }} className="bg-gray-600 w-full my-2 mr-2"
        >
            <div className="relative bg-white inset-0 border-black" style={{
                width: `${(deadLine - daysLeft) / deadLine * 100}%`,
                height: '2px'
            }}>
            </div>
        </div>
    )
}

export default ProgressBar