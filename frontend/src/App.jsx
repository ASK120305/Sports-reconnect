import { Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import DataUploadPage from './pages/DataUploadPage';
import VisualCertificateEditor from './pages/VisualCertificateEditor';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/data" element={<DataUploadPage />} />
      <Route path="/editor" element={<VisualCertificateEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
