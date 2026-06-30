import Router from '../router/index.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { FavoriteProvider } from './context/FavoriteContext.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import './App.css'

function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <FavoriteProvider>
          <Router />
          <CookieBanner />
        </FavoriteProvider>
      </OrderProvider>
    </CartProvider>
  )
}

export default App
