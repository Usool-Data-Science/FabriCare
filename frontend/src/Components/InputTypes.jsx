import { useState } from "react";
import Select from "react-select";

const GeneralInput = ({ showLabel, name, label, type, placeholder, error, fieldRef, value }) => {
    const [initialValue, setInitialValue] = useState(value || ''); // Initialize with default value

    const handleChange = (e) => {
        const { type, value, files } = e.target;
        if (type === 'file') {
            setInitialValue(files?.length > 1 ? files : files[0]);
        } else {
            setInitialValue(value);
        }
    };

    return (
        <div className="mb-4 w-full md:w-5/6 lg:1/2">
            {showLabel && label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-500"
                >
                    {label}
                </label>
            )}

            <input
                id={name}
                type={type || 'text'}
                name={name}
                placeholder={placeholder}
                ref={fieldRef}
                value={type === 'file' ? undefined : initialValue}
                multiple={type === 'file' && true}
                autoComplete="current-password"
                onChange={handleChange}
                className={type !== 'file' ? "bg-transparent border-b-2 border-slate-200 p-2 w-full focus:border-indigo-500 focus:outline-none text-slate-200" : "file-input file-input-bordered w-full max-w-xs bg-gray-400"}
            />
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
    );
};


export default GeneralInput;

export const SelectInput = ({ label, name, options, formData, setFormData, multiple }) => {
    return (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-gray-500">
                {label}
            </label>
            <Select
                id={label}
                name={name}
                value={multiple
                    ? options.filter(option => formData[name]?.includes(option.value)) // Match selected values
                    : options.find(option => option.value === formData[name]) // Match single selected value
                }
                isMulti={multiple}
                options={options}
                onChange={(selectedOptions) => {
                    const values = Array.isArray(selectedOptions)
                        ? selectedOptions.map((option) => option.value)
                        : selectedOptions?.value || ""; // Handle null case for single select
                    setFormData({ ...formData, [name]: values }); // Dynamically update the form field
                }}
                styles={{
                    control: (provided) => ({
                        ...provided,
                        backgroundColor: '#2d3748', // bg-gray-800
                        borderColor: '#4a5568', // Darker border
                        color: '#edf2f7', // Light text color
                        padding: '4px 8px',
                        borderRadius: '0.375rem',
                        boxShadow: 'none',
                        '&:hover': {
                            borderColor: '#63b3ed', // Hover color
                        },
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        color: '#edf2f7', // Ensure selected text color is readable
                    }),
                    menu: (provided) => ({
                        ...provided,
                        backgroundColor: '#2d3748', // bg-gray-800
                        color: '#edf2f7', // Light text for menu
                        borderRadius: '0.375rem',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                            ? '#4A90E2' // Selected option background
                            : state.isFocused
                                ? '#2B6CB0' // Hover background
                                : 'transparent', // Default
                        color: state.isSelected || state.isFocused ? '#fff' : '#edf2f7', // Readable text
                        padding: '8px 12px',
                        borderRadius: '0.375rem',
                        transition: 'background-color 0.2s ease',
                    }),
                    multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#4A90E2', // Light blue for selected values
                        color: '#fff',
                        borderRadius: '0.375rem',
                        padding: '2px 6px',
                        marginRight: '6px',
                    }),
                    multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#fff',
                    }),
                    multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#fff',
                        ':hover': {
                            backgroundColor: '#E53E3E', // Red color on hover to remove
                            color: '#fff',
                        },
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        color: '#edf2f7', // Placeholder color
                    }),
                }}
            />

        </div>
    );
};

