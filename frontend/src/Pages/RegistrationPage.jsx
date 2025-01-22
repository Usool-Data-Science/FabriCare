import { useNavigate } from 'react-router-dom'
import Body from '../Components/Body'
import { useRef, useState } from 'react';
import GeneralInput from '../Components/InputTypes';
import { useUser } from '../Contexts/UserProvider';
import { useFlash } from '../Contexts/FlashProvider';

const NewUser = () => {
    const { createUser } = useUser();
    const flash = useFlash();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const firstNameField = useRef();
    const lastNameField = useRef();
    const userNameField = useRef();
    const emailField = useRef();
    const passwordField = useRef();
    const password2Field = useRef();
    // const avatarField = useRef();

    const handleValidation = () => {
        const errors = {};
        if (!firstNameField.current.value.trim()) errors.first_name = 'First name must not be empty';
        if (!lastNameField.current.value.trim()) errors.last_name = 'Last name must not be empty';
        if (!userNameField.current.value.trim()) errors.username = 'username must not be empty';
        if (!emailField.current.value.trim()) errors.email = 'Email must not be empty';
        if (passwordField.current.value.trim() !== password2Field.current.value.trim()) errors.password2 = 'Passwords must match'

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleValidation()) return;

        setIsLoading(true);

        const response = await createUser(
            {
                first_name: firstNameField.current?.value.trim(),
                last_name: lastNameField.current?.value.trim(),
                username: userNameField.current?.value.trim(),
                email: emailField.current?.value.trim(),
                password: passwordField.current?.value.trim(),
            }
        );
        setIsLoading(false);
        if (response.ok) {
            {
                flash && flash('You have successfully registered!', 'success');
                navigate('/login');
            }


        }
    }

    return (
        <Body>
            <div className="flex flex-col items-center">
                <h1 className="text-3xl text-center font-extrabold text-slate-100 mt-8 mb-4">CREATE ACCOUNT</h1>
                <div className="w-full max-w-2xl bg-transparent rounded-lg shadow-lg p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 font-semibold text-sm md:text-lg lg:text-xl text-slate-100">
                            <GeneralInput
                                name="first_name"
                                label="First Name"
                                placeholder="Enter your first name"
                                error={formErrors.first_name}
                                fieldRef={firstNameField}
                            />
                            <GeneralInput
                                name="last_name"
                                label="Last Name"
                                placeholder="Enter your last name"
                                error={formErrors.last_name}
                                fieldRef={lastNameField}
                            />
                            <GeneralInput
                                name="username"
                                label="Username"
                                placeholder="e.g., John123"
                                error={formErrors.username}
                                fieldRef={userNameField}
                            />
                            <GeneralInput
                                name="email"
                                label="Email"
                                placeholder="e.g., good@example.com"
                                error={formErrors.email}
                                fieldRef={emailField}
                            />
                            <GeneralInput
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                error={formErrors.password}
                                fieldRef={passwordField}
                            />
                            <GeneralInput
                                name="password2"
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter your password"
                                error={formErrors.password2}
                                fieldRef={password2Field}
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-6 p-3 text-lg font-bold text-slate-100 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all duration-300 ease-in-out w-full mb-8"
                            aria-busy={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <progress className="progress w-6 h-6 text-slate-100"></progress>
                                    Registering...
                                </span>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>
                    <small className="font-myriad">Have an account? <a href='/login' className='text-blue-300'>Login here</a>
                    </small>
                </div>
            </div>
        </Body>
    );

};

export default NewUser;
