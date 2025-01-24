import { useCallback, useEffect, useState } from "react"
import Body from "../Components/Body"
import { useApi } from "../Contexts/ApiProvider"
import { Link } from "react-router-dom";

const HealthPage = () => {
    const api = useApi();
    const [health, setHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkHealth = useCallback(async () => {
        try {
            const response = await api.get('/health');
            if (response.ok) {
                setHealth('Healthy');
                setIsLoading(false);
            } else {
                setHealth('Unhealthy');
            }
        } catch (error) {
            console.error('Error fetching health status:', error);
            setHealth('Error');
        } finally {
            setIsLoading(false);
        }
    }, [api]);


    useEffect(() => {
        checkHealth();
    }, [checkHealth])

    return (

        <Body>
            <div className="flex justify-center items-center mt-8">
                {isLoading &&
                    <div className="flex w-96 flex-col gap-4">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-28"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>

                        <p className="py-8 inline">Please wait while we wake our API from sleep, this takes usually 50 secs</p>
                        <span className="loading loading-infinity loading-lg self-center"></span>
                    </div>}
                {!isLoading && health === 'Unhealthy' &&
                    <div className="card bg-red-700 w-auto shadow-xl">
                        <figure className="px-4 pt-14">
                            <img
                                src="/images/Fabricare.png"
                                alt="Fabricare Logo"
                                className="rounded-xl" />
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Sorry we could not reach our API server at this time!</h2>
                            <p className="pt-4">Thanks for waiting thus far, please try refreshing the browser after 50 seconds.</p>
                        </div>
                    </div>
                }
                {!isLoading && health === 'Healthy' &&
                    <div className="card bg-transparent w-auto shadow-xl">
                        <figure className="px-4 pt-14">
                            <img
                                src="/images/Fabricare.png"
                                alt="Fabricare Logo"
                                className="rounded-xl" />
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Fabricare API is now up and running</h2>
                            <p>Thanks for waiting thus far, would you like to navigate our app?</p>
                            <div className="card-actions mt-4">
                                <Link to='/landing' className="btn btn-primary">Go Home</Link>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </Body>
    )
}

export default HealthPage