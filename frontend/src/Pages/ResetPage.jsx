import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../Contexts/ApiProvider';
import { useFlash } from '../Contexts/FlashProvider';
import Body from '../Components/Body';
import GeneralInput from '../Components/InputTypes';

export default function ResetPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const passwordField = useRef();
    const password2Field = useRef();
    const navigate = useNavigate();
    const { search } = useLocation();
    const api = useApi();
    const flash = useFlash();
    const token = new URLSearchParams(search).get('token');

    useEffect(() => {
        if (!token) {
            navigate('/landing');
        }
        else {
            passwordField.current.focus();
        }
    }, [token, navigate]);

    const onSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        if (passwordField.current.value !== password2Field.current.value) {
            setFormErrors({ password2: "New passwords don't match" });
        }
        else {
            const response = await api.put('/tokens/reset', {
                token,
                new_password: passwordField.current.value
            });
            if (response.ok) {
                setFormErrors({});
                flash('Your password has been reset.', 'success');
                navigate('/login');
            }
            else {
                if (response.body.errors.json.new_password) {
                    setFormErrors(response.body.errors.json);
                }
                else {
                    flash('Password could not be reset. Please try again.', 'danger');
                    navigate('/reset-request');
                }
            }
        }
        setIsSubmitting(false);
    };

    return (
        <Body>
            <h1>Reset Your Password</h1>
            <form onSubmit={onSubmit}>
                <GeneralInput
                    name="password"
                    label="New password"
                    placeholder="Enter your new password"
                    error={formErrors.password}
                    fieldRef={passwordField}
                />
                <GeneralInput
                    name="password2"
                    label="New password again"
                    placeholder="Enter your new password again"
                    error={formErrors.password2}
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
                        'submit'
                    )}
                </button>
            </form>
        </Body>
    );
}