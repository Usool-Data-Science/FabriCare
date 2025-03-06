import FlashMessage from './FlashMessage'
import NavBar from './NavBar'

const Body = ({ loginButton, children }) => {
    return (
        <div className="flex flex-col min-h-screen font-myriad">
            {/* Navbar */}
            <NavBar loginButton={loginButton} />
            <FlashMessage />
            <div className="flex-grow mx-4 mt-16 px-2 py-2">
                {children}
            </div>

            {/* Footer: It stays at the bottom when content is short */}
            <footer className="py-6 flex flex-col sm:flex-row flex-wrap px-10 sm:justify-between gap-4">
                <div className="flex gap-4 font-courier text-lg">
                    <a href="https://linkedin.com/in/adeshina-software-engineer">
                        <span className="text-gray-100 font-arvo hover:underline hover:underline-offset-2">
                            LinkedIn
                        </span>
                    </a>
                    <p>Contact</p>
                </div>
                <p className="text-sm sm:text-lg" style={{ fontSize: '12px' }}>
                    © 2025 Fabricare. All Rights Reserved
                </p>
            </footer>
        </div>
    )
}

export default Body;
