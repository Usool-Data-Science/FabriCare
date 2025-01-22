import { useNavigate } from 'react-router-dom'
// import Body from '../Components/Body'
import { useProduct } from '../Contexts/ProductProvider';
import { useRef, useState } from 'react';
import GeneralInput, { SelectInput } from '../Components/InputTypes';
import { useFlash } from '../Contexts/FlashProvider';
import { useArtist } from '../Contexts/ArtistProvider';

const NewProduct = () => {
    const { createProduct, fetchPaginatedProducts, productPagination } = useProduct();
    const { artistNames } = useArtist();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const flash = useFlash();
    const titleField = useRef();
    const deadlineField = useRef();
    // const artistNameField = useRef();
    const goalField = useRef();
    const mainImageField = useRef();
    const subImageField = useRef();
    const compositionField = useRef();
    const colorField = useRef();
    // const styleField = useRef();
    const priceField = useRef();
    const quantityField = useRef();


    const [body, setBody] = useState({
        title: "",
        deadline: "",
        artist_name: "",
        goal: "",
        composition: "",
        color: "",
        price: "",
        quantity: "",
        sizes: "",
        mainImage: "",
        subImages: "",
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


    const handleValidation = () => {
        const errors = {};
        if (!titleField.current.value.trim()) errors.title = 'Title must not be empty';
        if (!deadlineField.current.value.trim()) errors.deadline = 'Deadline must not be empty';
        if (!goalField.current.value.trim()) errors.goal = 'Goal must not be empty';
        if (!compositionField.current.value.trim()) errors.composition = 'Composition must not be empty';
        if (!colorField.current.value.trim()) errors.color = 'Color must not be empty';
        if (!priceField.current.value.trim()) errors.price = 'Price must not be empty';
        // if (!styleField.current.value.trim()) errors.style = 'Style must not be empty';
        if (!quantityField.current.value.trim()) errors.quantity = 'Quantity must not be empty';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleValidation()) return;

        setIsLoading(true);
        try {
            const mainImageValues = mainImageField.current?.files
                ? Array.from(mainImageField.current.files).map((file) => file)
                : [];
            const subImageValues = subImageField.current?.files
                ? Array.from(subImageField.current.files).map((file) => file)
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
                sizes: body.sizes, // Ensure `sizes` is updated
                mainImage: mainImageValues, // Add mainImage
                subImages: subImageValues,  // Add subImage
            };

            setBody(updatedBody);
            const data = new FormData();
            Object.keys(updatedBody).forEach((key) => {
                if (Array.isArray(updatedBody[key])) {
                    updatedBody[key].forEach((value) => {
                        data.append(key, value);
                    });
                } else {
                    data.append(key, updatedBody[key]);
                }
            });

            const response = await createProduct("/products", data);
            if (response.ok) {
                // Reset the ref inputs
                fetchPaginatedProducts(productPagination.limit, productPagination.offset);
                navigate('/admin');
                titleField.current.value = '';
                deadlineField.current.value = '';
                goalField.current.value = '';
                compositionField.current.value = '';
                colorField.current.value = '';
                priceField.current.value = '';
                quantityField.current.value = '';
                mainImageField.current.value = null;
                subImageField.current.value = null;
            }
        } catch (error) {
            console.log(error);
            flash && flash("Error creating the product", 'error')
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col justify-center items-center gap-8 p-4">
            <h1 className="text-4xl font-extrabold text-slate-100 text-center">Create Product</h1>
            <div className="w-full max-w-6xl bg-gray-700 rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <GeneralInput
                            showLabel
                            name="title"
                            label="Product Title"
                            placeholder="Enter product title"
                            error={formErrors.title}
                            fieldRef={titleField}
                        />
                        <GeneralInput
                            showLabel
                            name="deadline"
                            label="Deadline"
                            placeholder="Enter deadline (e.g., 30 days)"
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
                            placeholder="Enter goal (e.g., 50 units)"
                            error={formErrors.goal}
                            fieldRef={goalField}
                        />
                        <GeneralInput
                            showLabel
                            name="composition"
                            label="Composition"
                            placeholder="Enter composition details"
                            error={formErrors.composition}
                            fieldRef={compositionField}
                        />
                        <GeneralInput
                            showLabel
                            name="color"
                            label="Color"
                            placeholder="Enter color (e.g., Red)"
                            error={formErrors.color}
                            fieldRef={colorField}
                        />
                        <GeneralInput
                            showLabel
                            name="price"
                            label="Price"
                            placeholder="Enter price (e.g., 2000)"
                            error={formErrors.price}
                            fieldRef={priceField}
                        />
                        <GeneralInput
                            showLabel
                            name="quantity"
                            label="Quantity"
                            placeholder="Enter quantity (e.g., 5)"
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
                        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
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
                        aria-busy={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <progress className="progress w-6 h-6 text-slate-100"></progress>
                                Creating Product...
                            </span>
                        ) : (
                            'Create Product'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );

};

export default NewProduct;
