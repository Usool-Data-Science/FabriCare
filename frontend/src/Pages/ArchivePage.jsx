import Archive from "../Components/Archive";
import Body from "../Components/Body";
import { useApi } from "../Contexts/ApiProvider";
import { useProduct } from "../Contexts/ProductProvider"

const ArchivePage = () => {
    const { products } = useProduct();
    const archiveProducts = products.filter(prod => prod.expire === true)
    const api = useApi()
    return (
        <Body>
            <div className="py-6 grow-1">
                {products === null && (
                    <span className="loading loading-ring loading-lg"></span>
                )}
                {archiveProducts?.length === 0 && <span className="grid place-content-center"> Archive is empty!</span>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {archiveProducts?.length > 0 &&
                        archiveProducts.map((product, index) => (
                            <Archive key={index} id={product.id} title={product.title} artist={product.artist_name} image={api.image_path + product.mainImage} />
                        ))}
                </div>

            </div>
        </Body>
    )
}

export default ArchivePage