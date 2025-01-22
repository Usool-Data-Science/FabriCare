import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../Contexts/ProductProvider';
import { useEffect, useRef, useState } from 'react';
import GeneralInput, { SelectInput } from '../Components/InputTypes';
import { useArtist } from '../Contexts/ArtistProvider';
import Body from '../Components/Body';

const ModifyProduct = () => {
    const [product, setProduct] = useState(null);
    const { fetchProduct, updateProduct, fetchPaginatedProducts, productPagination } = useProduct();
    const { artistNames } = useArtist();
    const { id } = useParams();
    const navigate = useNavigate();
    const [isModifying, setIsModifying] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Input field refs
    const titleField = useRef();
    const deadlineField = useRef();
    // const artistNameField = useRef();
    const goalField = useRef();
    const mainImageField = useRef();
    const subImageField = useRef();
    const compositionField = useRef();
    const colorField = useRef();
    const priceField = useRef();
    const quantityField = useRef();

    // Initial form state
    const [body, setBody] = useState({
        title: "",
        deadline: "",
        artist_name: "",
        goal: "",
        composition: "",
        color: "",
        price: "",
        quantity: "",
        sizes: [],
        mainImage: null,
        subImages: [],
    });

    const artistOptions = []

    if (artistNames.length > 0) {
        artistNames.forEach((name) => {
            artistOptions.push({
                value: name, label: name,
            })
        })
    }

    const sizeOptions = [
        { value: "S", label: "Small (S)" },
        { value: "M", label: "Medium (M)" },
        { value: "L", label: "Large (L)" },
        { value: "XL", label: "Extra Large (XL)" },
    ];

    // Validation function
    const handleValidation = () => {
        const errors = {};
        if (!titleField.current.value.trim()) errors.title = 'Product title is required';
        if (!deadlineField.current.value.trim()) errors.deadline = 'Deadline is required';
        if (!goalField.current.value.trim()) errors.goal = 'Goal is required';
        if (!compositionField.current.value.trim()) errors.composition = 'Composition is required';
        if (!colorField.current.value.trim()) errors.color = 'Color is required';
        if (!priceField.current.value.trim()) errors.price = 'Price is required';
        if (!quantityField.current.value.trim()) errors.quantity = 'Quantity is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleValidation()) return;

        setIsModifying(true);

        const mainImageValues = mainImageField.current?.files
            ? Array.from(mainImageField.current.files)
            : [];
        const subImageValues = subImageField.current?.files
            ? Array.from(subImageField.current.files)
            : [];

        const updatedBody = {
            ...body,
            title: titleField.current.value.trim(),
            deadline: deadlineField.current.value.trim(),
            goal: goalField.current.value.trim(),
            composition: compositionField.current.value.trim(),
            color: colorField.current.value.trim(),
            price: priceField.current.value.trim(),
            quantity: quantityField.current.value.trim(),
            artist_name: body.artist_name,
            sizes: body.sizes,
            mainImage: mainImageValues,
            subImages: subImageValues,
        };

        setBody(updatedBody);

        const data = new FormData();
        Object.keys(updatedBody).forEach((key) => {
            if (Array.isArray(updatedBody[key])) {
                updatedBody[key].forEach((value) => data.append(key, value));
            } else {
                data.append(key, updatedBody[key]);
            }
        });

        const response = await updateProduct(`/products/${id}`, data);
        setIsModifying(false);

        if (response.ok) {
            fetchPaginatedProducts(productPagination.limit, productPagination.offset);
            navigate('/admin');
        }
    };

    // Fetch product data on component mount
    useEffect(() => {
        const fetchProductData = async () => {
            const fetchedProduct = await fetchProduct(id);
            if (fetchedProduct) {
                setProduct(fetchedProduct);
                setBody({
                    title: fetchedProduct.title,
                    deadline: fetchedProduct.deadline,
                    artist_name: fetchedProduct.artist_name,
                    goal: fetchedProduct.goal,
                    composition: fetchedProduct.composition,
                    color: fetchedProduct.color,
                    price: fetchedProduct.price,
                    quantity: fetchedProduct.quantity,
                    sizes: fetchedProduct.sizes || [],
                    mainImage: null,
                    subImages: [],
                });
            }
        };

        fetchProductData();
    }, [id, fetchProduct]);

    if (!product) {
        return <span className="loading loading-ring loading-lg"></span>;
    }

    return (
        <Body>
            <div className="flex flex-col justify-center items-center gap-8 p-4">
                <h1 className="text-4xl font-extrabold text-slate-100 text-center">Modify Product</h1>
                <div className="w-full max-w-6xl bg-gray-700 rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-bold text-sm md:text-lg lg:text-2xl text-slate-100">
                            <GeneralInput
                                showLabel
                                name="title"
                                label="Product Title"
                                value={body.title}
                                error={formErrors.title}
                                fieldRef={titleField}
                            />
                            <GeneralInput
                                showLabel
                                name="deadline"
                                label="Deadline"
                                value={body.deadline}
                                error={formErrors.deadline}
                                fieldRef={deadlineField}
                            />
                            <div className="">
                                <SelectInput
                                    label='Artist Name'
                                    name="artist_name"
                                    options={artistOptions}
                                    formData={body}
                                    setFormData={setBody}
                                />
                            </div>
                            <GeneralInput
                                showLabel
                                name="goal"
                                label="Goal"
                                value={body.goal}
                                error={formErrors.goal}
                                fieldRef={goalField}
                            />
                            <GeneralInput
                                showLabel
                                name="composition"
                                label="Composition"
                                value={body.composition}
                                error={formErrors.composition}
                                fieldRef={compositionField}
                            />
                            <GeneralInput
                                showLabel
                                name="color"
                                label="Color"
                                value={body.color}
                                error={formErrors.color}
                                fieldRef={colorField}
                            />
                            <GeneralInput
                                showLabel
                                name="price"
                                label="Price"
                                value={body.price}
                                error={formErrors.price}
                                fieldRef={priceField}
                            />
                            <GeneralInput
                                showLabel
                                name="quantity"
                                label="Quantity"
                                value={body.quantity}
                                error={formErrors.quantity}
                                fieldRef={quantityField}
                            />
                            <GeneralInput
                                showLabel
                                name="mainImage"
                                label="Main Image"
                                type="file"
                                multiple={false}
                                fieldRef={mainImageField}
                            />
                            <GeneralInput
                                showLabel
                                name="subImage"
                                label="Sub Images"
                                type="file"
                                multiple={true}
                                fieldRef={subImageField}
                            />
                            <div className="sm:col-span-2 lg:col-span-3">
                                <SelectInput
                                    label="Sizes"
                                    name='sizes'
                                    options={sizeOptions}
                                    formData={body}
                                    setFormData={setBody}
                                    multiple={true}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full md:w-5/6 lg:w-1/2 mx-auto mt-8 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-lg font-bold transition-all duration-300 ease-in-out"
                            aria-busy={isModifying}
                            disabled={isModifying}
                        >
                            {isModifying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <progress className="progress w-6 h-6 text-slate-100"></progress>
                                    Updating Product...
                                </span>
                            ) : (
                                'Update Product'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </Body>
    );
};

export default ModifyProduct;
