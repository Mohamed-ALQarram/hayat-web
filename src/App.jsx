import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Login from './pages/Login';
import ReceptionDashboard from './pages/ReceptionDashboard';
import ReceptionDoctors from './pages/ReceptionDoctors';
import Layout from './components/Layout';
import DoctorLayout from './components/DoctorLayout';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="doctors" element={<ReceptionDoctors />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/doctor-dashboard" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
