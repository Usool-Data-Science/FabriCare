import { useContext } from 'react';
import { FlashContext } from '../Contexts/FlashProvider';

export default function FlashMessage() {
    const { flashMessage, visible, hideFlash } = useContext(FlashContext);

    return (
        <div
            className={`transition-all transform font-myriad duration-300 ease-out w-fit mx-auto
        ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        w-1/2 z-50 self-center`}
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >

            {visible && (
                flashMessage.type === 'success' ?
                    <div
                        className={`alert alert-success shadow-lg flex justify-between`}
                    >
                        <div>
                            <span>{flashMessage.message}</span>
                        </div>
                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={hideFlash}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div> :
                    flashMessage.type === 'error' ?
                        <div
                            className={`alert alert-error shadow-lg flex justify-between`}
                        >
                            <div>
                                <span>{flashMessage.message}</span>
                            </div>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={hideFlash}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div> :
                        flashMessage.type === 'info' ?
                            <div
                                className={`alert alert-info shadow-lg flex justify-between`}
                            >
                                <div>
                                    <span>{flashMessage.message}</span>
                                </div>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost"
                                    onClick={hideFlash}
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div> :
                            flashMessage.type === 'warning' ?
                                <div
                                    className={`alert alert-warning shadow-lg flex justify-between`}
                                >
                                    <div>
                                        <span>{flashMessage.message}</span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost"
                                        onClick={hideFlash}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div> :
                                <div
                                    className={`alert shadow-lg flex justify-between`}
                                >
                                    <div>
                                        <span>{flashMessage.message}</span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost"
                                        onClick={hideFlash}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div>
            )}
        </div>
    );
}
