import type { RouteObject } from 'react-router-dom'
import { lazy } from 'react'
import { featureFlags } from '../config/featureFlags'
import DashboardPage from '../pages/dashboard/page'

const HomePage = lazy(() => import('../pages/home/page'))
const LoginPage = lazy(() => import('../pages/auth/login'))
const LogoutPage = lazy(() => import('../pages/auth/logout'))
const RegisterPage = lazy(() => import('../pages/auth/register'))
const VerifyEmailPage = lazy(() => import('../pages/auth/verify-email'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password'))
const ChatPage = lazy(() => import('../pages/chat/page'))
const ContactPage = lazy(() => import('../pages/contact/page'))
const FeaturesPage = lazy(() => import('../pages/features/page'))
const PricingPage = lazy(() => import('../pages/pricing/page'))
const ProcessPage = lazy(() => import('../pages/process/page'))
const DemoPage = lazy(() => import('../pages/demo/page'))
const SettingsPage = lazy(() => import('../pages/settings/page'))
const AccountSettingsPage = lazy(() => import('../pages/settings/account'))
const EcountPage = lazy(() => import('../pages/settings/ecount'))
const EcountSetupPage = lazy(() => import('../pages/settings/ecount-setup'))
const OrdersAiEntryPage = lazy(() => import('../pages/orders/ai-entry'))
const OrderIntakePage = lazy(() => import('../pages/order-intake/page'))
const DocsPreviewPage = lazy(() => import('../pages/docs-preview/page'))
const TermsPage = lazy(() => import('../pages/terms/page'))
const PrivacyPage = lazy(() => import('../pages/privacy/page'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))
const ComingSoonPage = lazy(() => import('../pages/coming-soon/page'))

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/logout', element: <LogoutPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/chat', element: featureFlags.aiChat ? <ChatPage /> : <ComingSoonPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/features', element: <FeaturesPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/process', element: <ProcessPage /> },
  { path: '/demo', element: featureFlags.aiChat ? <DemoPage /> : <ComingSoonPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/settings/account', element: <AccountSettingsPage /> },
  { path: '/settings/ecount', element: featureFlags.ecount ? <EcountPage /> : <ComingSoonPage /> },
  { path: '/settings/ecount-setup', element: featureFlags.ecount ? <EcountSetupPage /> : <ComingSoonPage /> },
  { path: '/orders/ai-entry', element: featureFlags.ecount ? <OrdersAiEntryPage /> : <ComingSoonPage /> },
  { path: '/order-intake', element: <OrderIntakePage /> },
  { path: '/docs-preview', element: featureFlags.docs ? <DocsPreviewPage /> : <ComingSoonPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export default routes
