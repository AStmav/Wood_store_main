import Router from '../router/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { FavoriteProvider } from './context/FavoriteContext.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import './App.css'

function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <FavoriteProvider>
            <Router />
            <CookieBanner />
          </FavoriteProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App 