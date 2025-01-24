import { Navigate, Route, Routes } from "react-router-dom"
import PublicRoute from "./Components/PublicRoute"
import PrivateRoute from "./Components/PrivateRoute"
import Sale from "./Components/Sale"
import LoginPage from "./Pages/LoginPage"
import LandingPage from "./Pages/LandingPage"
import AdminPage from "./Pages/AdminPage"
import ModifyProduct from "./Pages/ModifyProduct"
import NewProduct from "./Pages/NewProduct"
import NewUser from "./Pages/RegistrationPage"
import HomePage from "./Pages/HomePage"
import ProviderStore from "./Contexts/ProviderStore"
import CartPage from "./Pages/CartPage"
import SuccessPage from "./Pages/SuccessPage"
import CancelPage from "./Pages/CancelPage"
import ResetRequestPage from "./Pages/ResetRequestPage"
import ResetPage from "./Pages/ResetPage"
import HealthPage from "./Pages/HealthPage"


function App() {
  return (
    <div className="min-h-screen flex flex-col bg-opacity-85 text-gray-100 overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* <Header /> */}
      <ProviderStore>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><HealthPage /></PublicRoute>} />
          <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><NewUser /></PublicRoute>} />
          <Route path="/reset-request" element={<PublicRoute><ResetRequestPage /></PublicRoute>} />
          <Route path="/reset" element={<PublicRoute><ResetPage /></PublicRoute>} />

          {/* Private Routes */}
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/sales/:id" element={<PrivateRoute><Sale /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><NewProduct /></PrivateRoute>} />
          <Route path="/me/carts" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/order/success" element={<PrivateRoute><SuccessPage /></PrivateRoute>} />
          <Route path="/order/cancel" element={<PrivateRoute><CancelPage /></PrivateRoute>} />
          <Route path="/products/:id" element={<PrivateRoute><ModifyProduct /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </ProviderStore>
    </div>
  )
}

export default App
