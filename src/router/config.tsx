import { RouteObject } from 'react-router-dom';
import Home from '../pages/home/page';
import Dashboard from '../pages/dashboard/page';
import ChatPage from '../pages/chat/page';
import SettingsPage from '../pages/settings/page';
import NotFound from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;