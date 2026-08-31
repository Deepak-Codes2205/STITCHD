import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { useNavigate } from 'react-router';


const Register = () => {

    const { handleRegister } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        password: '',
        isSeller: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister({
            email: formData.email,
            contact: formData.contactNumber,
            password: formData.password,
            fullname: formData.fullName,
            isSeller: formData.isSeller
        });
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-200 flex">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black">
                <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
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
                            Redefining <br /> <span className="text-yellow-500 font-sans not-italic font-bold tracking-widest uppercase text-4xl">Elegance</span>
                        </h2>
                        <p className="text-gray-300 text-lg max-w-md font-light tracking-wide leading-relaxed">
                            Join the premier destination for exclusive fashion. Discover curated collections and elevate your everyday style.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-10 lg:px-16 lg:py-8 relative">
                {/* Mobile logo */}
                <div className="absolute top-8 left-8 lg:hidden text-2xl font-bold tracking-[0.2em] text-white">
                    STITCHD<span className="text-yellow-500">.</span>
                </div>

                <div className="w-full max-w-md mt-10 lg:mt-0">
                    <div className="mb-6">
                        <h1 className="text-3xl font-light tracking-wide text-white mb-2">Create an Account</h1>
                        <p className="text-gray-400 text-sm tracking-wide">Enter your details to become a member.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            {/* Full Name */}
                            <div className="relative pt-3">
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent"
                                    placeholder="Full Name"
                                    required
                                />
                                <label
                                    htmlFor="fullName"
                                    className="absolute left-0 top-0.5 text-gray-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-6 peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-yellow-500 uppercase tracking-widest"
                                >
                                    Full Name
                                </label>
                            </div>

                            {/* Email */}
                            <div className="relative pt-3">
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

                            {/* Contact Number */}
                            <div className="relative pt-3">
                                <input
                                    type="tel"
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent"
                                    placeholder="Contact Number"
                                    required
                                />
                                <label
                                    htmlFor="contactNumber"
                                    className="absolute left-0 top-0.5 text-gray-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-6 peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-yellow-500 uppercase tracking-widest"
                                >
                                    Contact Number
                                </label>
                            </div>

                            {/* Password */}
                            <div className="relative pt-3">
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

                        {/* isSeller Checkbox */}
                        <div className="flex items-center pt-2 -ml-3">
                            <label className="relative flex items-center p-3 rounded-full cursor-pointer" htmlFor="isSeller">
                                <input
                                    type="checkbox"
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-600 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-yellow-500 before:opacity-0 before:transition-opacity checked:border-yellow-500 checked:bg-yellow-500 checked:before:bg-yellow-500 hover:before:opacity-10"
                                    id="isSeller"
                                    name="isSeller"
                                    checked={formData.isSeller}
                                    onChange={handleChange}
                                />
                                <span className="absolute text-black transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </span>
                            </label>
                            <label htmlFor="isSeller" className="text-sm font-light tracking-wide text-gray-400 cursor-pointer select-none">
                                I want to register as a Seller
                            </label>

                        </div>

                        {/* Google Auth */}
                        <div className="pt-2">
                            <a
                                href="/api/auth/google"
                                className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold uppercase tracking-widest text-sm py-3 transition-all duration-300 ease-in-out"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold uppercase tracking-widest text-sm py-3 mt-4 transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        >
                            Join STITCHD
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm font-light text-gray-500 tracking-wide">
                        Already a member?{' '}
                        <a href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors duration-200 border-b border-transparent hover:border-yellow-400 pb-0.5">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;