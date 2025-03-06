import { useState, useEffect, useRef } from 'react';
import GeneralInput from '../Components/InputTypes';
import { useApi } from '../Contexts/ApiProvider';
import { useFlash } from '../Contexts/FlashProvider';
import Body from '../Components/Body';

export default function ResetRequestPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const emailField = useRef();
    const api = useApi();
    const flash = useFlash();

    useEffect(() => {
        emailField.current.focus();
    }, []);

    const onSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        const response = await api.post('/tokens/reset', {
            email: emailField.current.value,
        });
        setIsSubmitting(false);
        if (!response.ok) {
            setFormErrors(response.body.errors.json);
        }
        else {
            emailField.current.value = '';
            setFormErrors({});
            flash(
                'You will receive an email with instructions ' +
                'to reset your password.', 'info'
            );
        }
    };

    return (
        <Body loginButton>
            <h2 className="text-3xl text-center font-extrabold text-slate-100 mt-8 mb-4 font-courier">Reset Your Password</h2>
            <div className="flex justify-center items-center ">
                <div className="w-full max-w-lg bg-transparent shadow-lg p-8">
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col items-center gap-6"
                    >
                        <GeneralInput
                            name="email"
                            label="Email"
                            placeholder="Enter your email"
                            error={formErrors.username}
                            fieldRef={emailField}
                        />
                        <button
                            type="submit"
                            className="w-full md:w-4/5 lg:w-2/3 mt-6 text-lg font-bold text-slate-100 transition-all duration-300 ease-in-out mb-8 border border-gray-50 hover:text-red-500 p-3 font-courier"
                            aria-busy={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <progress className="progress w-6 h-6 text-slate-100"></progress>
                                    Processing...
                                </span>
                            ) : (
                                'Submit'
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </Body >
    );
}