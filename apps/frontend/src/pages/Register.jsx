import { useState } from 'react';
import axios from '../api/clients.js';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import PersonalDataConsent from '../components/PersonalDataConsent.jsx';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [personalDataConsent, setPersonalDataConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Очищаем ошибку при изменении полей
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.first_name) {
      setError('Пожалуйста, заполните все обязательные поля');
      return false;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (!personalDataConsent) {
      setConsentError('Отметьте согласие на обработку персональных данных, чтобы отправить заявку.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      await axios.post('/users/', {
        email: formData.email,
        password: formData.password,
        password2: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        personal_data_consent: true,
      });
      
      navigate('/login', { 
        state: { message: 'Регистрация успешна! Теперь вы можете войти в систему.' }
      });
    } catch (err) {
      if (err.response?.data?.email) {
        setError('Пользователь с таким email уже существует');
      } else if (err.response?.data?.personal_data_consent) {
        const message = Array.isArray(err.response.data.personal_data_consent)
          ? err.response.data.personal_data_consent[0]
          : err.response.data.personal_data_consent;
        setConsentError(message);
      } else if (err.response?.data) {
        setError(Object.values(err.response.data).flat().join(', '));
      } else {
        setError('Ошибка регистрации. Попробуйте позже.');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Регистрация
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Создайте аккаунт для покупок
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Введите email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Имя *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Введите имя"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Введите фамилию"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Пароль *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                  Подтвердите пароль *
                </label>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Повторите пароль"
                  value={formData.password_confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <PersonalDataConsent
              checked={personalDataConsent}
              onChange={(e) => {
                setPersonalDataConsent(e.target.checked);
                setConsentError('');
                setError('');
              }}
              error={consentError}
            />

            <div>
              <button
                type="submit"
                disabled={loading || !personalDataConsent}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Уже есть аккаунт? Войти
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
