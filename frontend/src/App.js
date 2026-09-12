import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import StudentDashboardLayout from './layouts/StudentDashboardLayout';
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ButtonLink, EmptyState, LoadingSpinner } from './components/common/UI';
import Home from './pages/public/Home';
const About = lazy(() => import('./pages/public/About'));
const AuthPage = lazy(() => import('./pages/public/AuthPage'));
const BrowseJobs = lazy(() => import('./pages/public/BrowseJobs'));
const JobDetails = lazy(() => import('./pages/public/JobDetails'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const Applications = lazy(() => import('./pages/student/Applications'));
const ApplicationDetails = lazy(() => import('./pages/student/ApplicationDetails'));
const SavedJobs = lazy(() => import('./pages/student/SavedJobs'));
const Interviews = lazy(() => import('./pages/student/Interviews'));
const Calendar = lazy(() => import('./pages/student/Calendar'));
const Notifications = lazy(() => import('./pages/student/Notifications'));
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const CompanyProfile = lazy(() => import('./pages/provider/Profile'));
const JobManagement = lazy(() => import('./pages/provider/Jobs'));
const JobEditor = lazy(() => import('./pages/provider/JobEditor'));
const Applicants = lazy(() => import('./pages/provider/Applicants'));
const CandidateDetails = lazy(() => import('./pages/provider/CandidateDetails'));
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const segment = pathname.split('/').filter(Boolean).pop();
    const label = segment
      ? segment.replaceAll('-', ' ')
      : 'Your next chapter starts here';
    document.title = `${label.charAt(0).toUpperCase() + label.slice(1)} | InternTrack`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <ErrorBoundary>
      <RouteEffects />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<AuthPage key="login" />} />
            <Route path="register" element={<AuthPage key="register" register />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route
              path="*"
              element={
                <div className="container public-page">
                  <EmptyState
                    title="A little off the beaten path."
                    description="This page doesn’t exist, but your next opportunity does."
                    action={<ButtonLink to="/">Find your way home</ButtonLink>}
                  />
                </div>
              }
            />
          </Route>
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="student" element={<StudentDashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applications/:id" element={<ApplicationDetails />} />
              <Route path="saved-jobs" element={<SavedJobs />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute role="provider" />}>
            <Route path="provider" element={<ProviderDashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route path="jobs" element={<JobManagement />} />
              <Route path="jobs/new" element={<JobEditor />} />
              <Route path="jobs/:id/edit" element={<JobEditor />} />
              <Route path="jobs/:id/applicants" element={<Applicants />} />
              <Route path="applicants" element={<Applicants />} />
              <Route path="applicants/:id" element={<CandidateDetails />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
