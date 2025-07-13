// client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner'; 
import { toast } from 'react-toastify'; 

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/'); // Redirect to home page if already logged in
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!username || !email || !password) {
            toast.error('Please enter all fields.'); 
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.'); 
            setIsSubmitting(false);
            return;
        }

        const success = await register(username, email, password);

        if (success) {
            toast.success('Registration successful! You are now logged in.', { autoClose: 1500 }); 
        } else {
            toast.error('Registration failed. Please check your input and try again.'); 
        }
        setIsSubmitting(false);
    };

    if (authLoading || isAuthenticated) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8"> 
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm sm:max-w-md">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 text-center mb-6 sm:mb-8">Register for Network Manager</h2> 
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="Your Username"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-2"> 
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 mb-2"> 
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'} 
                    </Button>
                </form>
                <p className="mt-5 sm:mt-6 text-center text-gray-600 text-sm sm:text-base"> 
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;