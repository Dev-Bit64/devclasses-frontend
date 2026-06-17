import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store from './redux/store.tsx'

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Provider>
)
