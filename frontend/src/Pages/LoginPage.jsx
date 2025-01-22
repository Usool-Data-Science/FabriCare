import { useLocation, useNavigate } from "react-router-dom";
import GeneralInput from "../Components/InputTypes";
import { useFlash } from "../Contexts/FlashProvider";
import { useUser } from "../Contexts/UserProvider";
import { useRef, useState, useEffect } from "react";
import Body from "../Components/Body";

const LoginPage = () => {
    const [formErrors, setFormErrors] = useState({});
    const usernameField = useRef();
    const passwordField = useRef();
    const { login, adminUser, user } = useUser();
    const flash = useFlash();
    const navigate = useNavigate();
    const location = useLocation();
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
        }
        setIsSubmitting(false);
    };
    useEffect(() => {
        // Redirect to admin or home page only if user is already logged in
        if (user && adminUser) {
            navigate(location.state?.next || '/admin');
        } else if (user) {
            navigate(location.state?.next || '/home');
        } else {
            navigate('/login');
        }
    }, [user, adminUser, navigate, location.state]);


    return (
        <Body>
            <h2 className="text-3xl text-center font-extrabold text-slate-100 mt-8 mb-4">LOGIN</h2>
            <div className="flex justify-center items-center ">
                <div className="w-full max-w-lg bg-gray-700 rounded-lg shadow-lg p-8">
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
                            className="w-full md:w-4/5 lg:w-2/3 p-3 mt-6 text-lg font-bold text-slate-100 bg-gray-500 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out mb-8"
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
                    <div className="flex flex-col items-start gap-4">
                        <small className="font-myriad text-center">Dont have an account? <a href='/register' className='text-blue-300'>Register here</a>
                        </small>
                        <small className="font-myriad text-center">Forget Password? <a href='/reset-request' className='text-blue-300'>Reset it here</a>
                        </small>
                    </div>
                </div>
            </div>
        </Body>
    );

};

export default LoginPage;
