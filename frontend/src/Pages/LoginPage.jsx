import { useLocation, useNavigate } from "react-router-dom";
import GeneralInput from "../Components/InputTypes";
import { useFlash } from "../Contexts/FlashProvider";
import { useUser } from "../Contexts/UserProvider";
import { useEffect, useRef, useState } from "react";
import Body from "../Components/Body";

const LoginPage = () => {
    const [formErrors, setFormErrors] = useState({});
    const usernameField = useRef();
    const passwordField = useRef();
    const { login, adminUser, user } = useUser();
    const flash = useFlash();
    const navigate = useNavigate();
    const location = useLocation();
    const [nextPage,] = useState(location.state?.next);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValidation = () => {
        const errors = {};
        if (!usernameField.current.value.trim()) {
            errors.username = 'Username must not be empty.';
        }
        if (!passwordField.current.value.trim()) {
            errors.password = 'Password must not be empty.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!handleValidation()) return;

        setIsSubmitting(true);
        const username = usernameField.current.value.trim();
        const password = passwordField.current.value.trim();

        const result = await login(username, password)
        if (result === 'fail') {
            flash('Invalid username or password', 'error');
            setIsSubmitting(false);
            return;
        }
    };

    useEffect(() => {
        console.log('Next Page: ' + nextPage);
        if (user && adminUser) {
            navigate(nextPage || '/admin');
        } else if (user) {
            navigate(nextPage || '/home');
        } else {
            navigate('/login')
        }
    }, [user, adminUser, navigate, nextPage])

    return (
        <Body>
            <h2 className="text-3xl text-center font-extrabold text-slate-100 mt-8 mb-4 font-courier">LOGIN</h2>
            <div className="flex justify-center items-center ">
                <div className="w-full max-w-lg bg-transparent shadow-lg p-8">
                    <form
                        onSubmit={handleLogin}
                        className="flex flex-col items-center gap-6"
                    >
                        <GeneralInput
                            name="username"
                            label="Username or Email"
                            placeholder="Enter your username or email"
                            error={formErrors.username}
                            fieldRef={usernameField}
                        />
                        <GeneralInput
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            error={formErrors.password}
                            fieldRef={passwordField}
                        />
                        <button
                            type="submit"
                            className="w-full md:w-4/5 lg:w-2/3 p-2 mt-6 text-lg font-bold border border-gray-50 text-slate-100 bg-transparent hover:text-red-500 transition-all duration-300 ease-in-out mb-8"
                            aria-busy={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <progress className="progress w-6 h-6 text-slate-100"></progress>
                                    Processing...
                                </span>
                            ) : (
                                'NEXT'
                            )}
                        </button>
                    </form>
                    <div className="flex flex-col items-center gap-4 font-courier justify-start text-sm">
                        <small className="text-center">Dont have an account? <a href='/register' className='text-blue-300'>Register here</a>
                        </small>
                        <small className="text-center">Forget Password? <a href='/reset-request' className='text-blue-300'>Reset it here</a>
                        </small>
                    </div>
                </div>
            </div>
        </Body>
    );

};

export default LoginPage;
