import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import LoginRegisterForm from '../components/auth/LoginRegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import TermsModal from '../components/auth/TermsModal';
import { validatePassword } from '../lib/password';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState('form');
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '', pin: '',
  });
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const [forgotData, setForgotData] = useState({ email: '', password: '', password_confirmation: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const unmetRules = validatePassword(forgotData.password);
    if (unmetRules.length > 0) {
      setForgotError(`password requires: ${unmetRules[0]}`);
      return;
    }
    if (forgotData.password !== forgotData.password_confirmation) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      await api.post('/password/forgot', forgotData);
      setForgotSuccess('Password updated! You can log in with your new password now.');
      setForgotData({ email: '', password: '', password_confirmation: '' });
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/auth/google', { token: tokenResponse.access_token });
        const { access_token } = res.data;
        localStorage.setItem('token', access_token);
        window.location.reload();
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in popup was closed or failed.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLogin) {
      const unmetRules = validatePassword(formData.password);
      if (unmetRules.length > 0) {
        setError(`password requires: ${unmetRules[0]}`);
        setLoading(false);
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!agreeToTerms) {
        setError('Please agree to the terms and conditions to continue.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        if (rememberMe) localStorage.setItem('remembered_email', formData.email);
        else localStorage.removeItem('remembered_email');
        await login(formData.email, formData.password, rememberMe);
      } else {
        await register(formData.name, formData.email, formData.password, formData.password_confirmation, formData.pin);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md rounded-3xl p-8 flex flex-col gap-5 animate-cute-pop" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        {view === 'forgot' ? (
          <ForgotPasswordForm
            forgotData={forgotData}
            onChange={handleForgotChange}
            onSubmit={handleForgotSubmit}
            loading={forgotLoading}
            error={forgotError}
            success={forgotSuccess}
            onBackToLogin={() => setView('form')}
          />
        ) : (
          <LoginRegisterForm
            isLogin={isLogin}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            error={error}
            loading={loading}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onForgotClick={() => {
              setForgotError(null);
              setForgotSuccess(null);
              setView('forgot');
            }}
            agreeToTerms={agreeToTerms}
            setAgreeToTerms={setAgreeToTerms}
            onShowTerms={() => setShowTermsModal(true)}
            onGoogleLogin={() => handleGoogleLogin()}
            onToggleMode={() => {
              setIsLogin(!isLogin);
              setError(null);
              setAgreeToTerms(false);
            }}
          />
        )}
      </div>

      {showTermsModal && (
        <TermsModal
          onDecline={() => setShowTermsModal(false)}
          onAgree={() => {
            setAgreeToTerms(true);
            setShowTermsModal(false);
          }}
        />
      )}
    </div>
  );
}