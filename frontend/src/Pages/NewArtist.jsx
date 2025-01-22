import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtist } from '../Contexts/ArtistProvider';
import GeneralInput from '../Components/InputTypes';
import { useFlash } from '../Contexts/FlashProvider';

const RegisterArtist = () => {
    // const [artist, setArtist] = useState({
    //     name: '',
    //     image: '',
    //     description: '',
    //     website: '',
    // });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const nameField = useRef();
    const imageField = useRef();
    const descriptionField = useRef();
    const websiteField = useRef();
    const navigate = useNavigate();
    const { createArtist, fetchPaginatedArtists, artistsPagination } = useArtist();
    const flash = useFlash();

    const handleValidation = () => {
        const errors = {};
        if (!nameField.current.value.trim()) errors.name = 'Name must not be empty';
        if (!descriptionField.current.value.trim()) errors.description = 'Description must not be empty';
        if (!websiteField.current.value.trim()) errors.website = 'Website URL must not be empty';
        if (!imageField.current.files) errors.image = 'Artist image must not be empty'

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleValidation()) return;

        setIsSubmitting(true);
        try {
            const newArtist = {
                name: nameField.current.value.trim(),
                image: imageField.current.files[0],
                description: descriptionField.current.value.trim(),
                website: websiteField.current.value.trim(),
            };

            const data = new FormData();
            Object.keys(newArtist).forEach((key) => {
                if (Array.isArray(newArtist[key])) {
                    newArtist[key].forEach((value) => data.append(key, value));
                } else {
                    data.append(key, newArtist[key]);
                }
            });


            const response = await createArtist("/artists", data);

            if (response.ok) {
                nameField.current.value = "";
                imageField.current.value = "";
                descriptionField.current.value = "";
                websiteField.current.value = "";
                fetchPaginatedArtists(artistsPagination.limit, artistsPagination.offset);
                navigate('/admin');
            }
        } catch (error) {
            console.log(error);
            flash && flash("Error creating the artist", 'error')
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-8 p-4">
            <h1 className="text-4xl font-extrabold text-slate-100 text-center">Add New Artist</h1>
            <div className="w-full max-w-6xl bg-gray-700 rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="flex flex-col mx-24">
                    <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-bold text-sm md:text-lg lg:text-2xl text-slate-100">
                        <GeneralInput
                            showLabel
                            name="name"
                            label="Artist Name"
                            error={formErrors.name}
                            fieldRef={nameField}
                        />
                        <GeneralInput
                            showLabel
                            name="image"
                            label="Artist Image"
                            type="file"
                            error={formErrors.image}
                            fieldRef={imageField}
                        />
                        <GeneralInput
                            showLabel
                            name="description"
                            label="Artist Description"
                            error={formErrors.description}
                            fieldRef={descriptionField}
                        />
                        <GeneralInput
                            showLabel
                            name="website"
                            label="Artist Website"
                            error={formErrors.website}
                            fieldRef={websiteField}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-5/6 lg:w-1/2 mx-auto mt-8 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-lg font-bold transition-all duration-300 ease-in-out"
                        aria-busy={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <progress className="progress text-slate-200"></progress> : 'Register Artist'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterArtist;
