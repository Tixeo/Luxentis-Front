import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import HomePage from './pages/home';
import EnterprisePage from './pages/entreprise';
import ManageEnterprisePage from './pages/manage-enterprise';
import ChangePassword from './pages/change-password';
import MapPage from './pages/map';
import JobPage from './pages/job';
import { ThemeProvider } from './lib/theme-provider';
import { Toaster } from './components/ui/toaster';
import { StoreInitializer } from './lib/zustand-init';
import LawsPage from './pages/lois';
import ProfilePage from './pages/profile';
import MarketPage from './pages/market';
import NotFoundPage from './pages/notfound';
import BankPage from './pages/banque';
import BankAccountPage from './pages/banque/compte';
import NewBankAccountPage from './pages/banque/nouveau-compte';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Register />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/change-password',
    element: <ChangePassword />
  },
  {
    path: '/home',
    element: <HomePage />
  },
  {
    path: '/entreprises',
    element: <EnterprisePage />
  },
  {
    path: '/entreprise',
    element: <EnterprisePage />
  },
  {
    path: '/manage-enterprise',
    element: <ManageEnterprisePage />
  },
  {
    path: '/map',
    element: <MapPage />
  },
  {
    path: '/job',
    element: <JobPage />
  },
  {
    path: '/lois',
    element: <LawsPage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/market',
    element: <MarketPage />
  },
  {
    path: '/drive',
    element: <MarketPage />
  },
  {
    path: '/banque',
    element: <BankPage />
  },
  {
    path: '/banque/compte/:accountId',
    element: <BankAccountPage />
  },
  {
    path: '/banque/nouveau-compte',
    element: <NewBankAccountPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

function App() {
  return (
    <ThemeProvider>
      <StoreInitializer />
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;