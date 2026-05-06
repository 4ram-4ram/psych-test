import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import IntroPage from './pages/IntroPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/intro/:id" element={<IntroPage />} />
        <Route path="/test/:id" element={<QuizPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
