import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { AcceptInvitePage } from '../pages/AcceptInvitePage'
import { AppShell } from '../layout/AppShell'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { PageDetailPage } from '../pages/PageDetailPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { WorkspaceHomePage } from '../pages/WorkspaceHomePage'
import { WorkspaceSettingsPage } from '../pages/WorkspaceSettingsPage'

const rootRoute = createRootRoute({
  component: Outlet,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppShell,
})

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: WorkspaceHomePage,
})

const pageDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/pages/$pageId',
  component: PageDetailPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: WorkspaceSettingsPage,
})

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/profile',
  component: ProfilePage,
})

// Only ever redirect to a same-site relative path — `next` comes straight from a
// URL query param, so anything else (an absolute URL, or `//host/...` which the
// browser treats as protocol-relative) would be an open-redirect vector. Omitting
// the key (rather than defaulting to '') when absent/invalid keeps `next` an
// optional search param, so existing `<Link to="/login">` call sites don't need it.
const nextSearch = (search: Record<string, unknown>): { next?: string } => {
  const next = typeof search.next === 'string' && search.next.startsWith('/') && !search.next.startsWith('//') ? search.next : undefined
  return next ? { next } : {}
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: nextSearch,
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const forgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
})

const tokenSearch = (search: Record<string, unknown>) => ({
  token: typeof search.token === 'string' ? search.token : '',
})

const resetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  validateSearch: tokenSearch,
  component: ResetPasswordPage,
})

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  validateSearch: tokenSearch,
  component: VerifyEmailPage,
})

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invite',
  validateSearch: tokenSearch,
  component: AcceptInvitePage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute.addChildren([appIndexRoute, pageDetailRoute, settingsRoute, profileRoute]),
  loginRoute,
  registerRoute,
  forgotRoute,
  resetRoute,
  verifyRoute,
  inviteRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
