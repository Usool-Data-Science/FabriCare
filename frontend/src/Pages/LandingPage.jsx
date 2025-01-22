import { useProduct } from "../Contexts/ProductProvider"
import Body from "../Components/Body"
import GeneralPage from "./GeneralPage";




const LandingPage = () => {
    const { products } = useProduct();

    return (
        <Body loginButton search>
            <GeneralPage products={products} />
        </Body>
    )
}

export default LandingPage