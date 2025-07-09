// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import AddDevicePage from './pages/AddDevicePage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50"> {/* Changed bg-gray-100 to bg-gray-50 */}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8"> {/* Adjusted padding */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/device/:id" element={<DeviceDetailPage />} />
            <Route path="/device/add" element={<AddDevicePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;