import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { useNavigate } from 'react-router';

const Login = () => {
    const { handlelogin } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handlelogin({
            email: formData.email,
            password: formData.password,
        });
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-200 flex">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black">
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                    alt="STITCHD Fashion"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-black/10"></div>

                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    <div className="text-3xl font-bold tracking-[0.3em] text-white">
                        STITCHD<span className="text-yellow-500">.</span>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-5xl font-light text-white leading-tight mb-6 font-serif italic">
                            Welcome <br /> <span className="text-yellow-500 font-sans not-italic font-bold tracking-widest uppercase text-4xl">Back</span>
                        </h2>
                        <p className="text-gray-300 text-lg max-w-md font-light tracking-wide leading-relaxed">
                            Sign in to access your curated collections and discover the latest in exclusive fashion.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative">
                {/* Mobile logo */}
                <div className="absolute top-8 left-8 lg:hidden text-2xl font-bold tracking-[0.2em] text-white">
                    STITCHD<span className="text-yellow-500">.</span>
                </div>

                <div className="w-full max-w-md mt-10 lg:mt-0">
                    <div className="mb-12">
                        <h1 className="text-3xl font-light tracking-wide text-white mb-3">Sign In</h1>
                        <p className="text-gray-400 text-sm tracking-wide">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            {/* Email */}
                            <div className="relative pt-4">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent"
                                    placeholder="Email Address"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-0.5 text-gray-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-6 peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-yellow-500 uppercase tracking-widest"
                                >
                                    Email Address
                                </label>
                            </div>

                            {/* Password */}
                            <div className="relative pt-4">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent"
                                    placeholder="Password"
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-0 top-0.5 text-gray-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-6 peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-yellow-500 uppercase tracking-widest"
                                >
                                    Password
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold uppercase tracking-widest text-sm py-4 mt-12 transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-12 text-center text-sm font-light text-gray-500 tracking-wide">
                        Don't have an account?{' '}
                        <a href="/register" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors duration-200 border-b border-transparent hover:border-yellow-400 pb-0.5">
                            Join STITCHD
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
