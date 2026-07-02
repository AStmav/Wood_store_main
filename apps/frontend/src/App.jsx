import Router from '../router/index.jsx'
import { MyProductsProvider } from './context/MyProductsContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import './App.css'

function App() {
  return (
    <MyProductsProvider>
      <OrderProvider>
        <Router />
        <CookieBanner />
      </OrderProvider>
    </MyProductsProvider>
  )
}

export default App
