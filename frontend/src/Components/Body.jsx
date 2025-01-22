import FlashMessage from './FlashMessage'
import NavBar from './NavBar'

const Body = ({ loginButton, children }) => {
    return (
        <div className='flex flex-col justify-center font-myriad'>
            {/* Include the search prop in the Navbar to show search bar */}
            <NavBar loginButton={loginButton} />
            <FlashMessage />
            <div className='mx-4 px-2 py-2'>
                {children}
            </div>
        </div>
    )
}

export default Body