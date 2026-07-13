import Router from '../router/index.jsx'
import { MyProductsProvider } from './context/MyProductsContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import './App.css'

function App() {
  return (
    <MyProductsProvider>
      <OrderProvider>
        <Router />
      </OrderProvider>
    </MyProductsProvider>
  )
}

export default App
