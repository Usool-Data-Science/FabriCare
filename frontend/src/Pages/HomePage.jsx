import { useProduct } from "../Contexts/ProductProvider"
import Body from "../Components/Body"
import GeneralPage from "./GeneralPage";


const HomePage = () => {
    const { products } = useProduct();

    return (
        <Body search>
            <GeneralPage products={products} />
        </Body>
    )
}

export default HomePage