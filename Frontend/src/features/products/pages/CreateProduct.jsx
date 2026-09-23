import React, { useState } from 'react';
import { useProduct } from "../hooks/useProduct"
import { useDispatch } from "react-redux"
import { setSellerProducts } from "../state/product.slice"

const CreateProduct = () => {

    const { handleCreateproduct, handleGetSellerProduct } = useProduct();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'USD',
        images: []
    });

    const [dragActive, setDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 7) {
            alert('You can only upload up to 7 images.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files].slice(0, 7)
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            if (formData.images.length + files.length > 7) {
                alert('You can only upload up to 7 images.');
                return;
            }
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...files].slice(0, 7)
            }));
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Construct FormData for API if images are files
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('priceAmount', formData.priceAmount);
            data.append('priceCurrency', formData.priceCurrency);
            formData.images.forEach((img) => data.append('images', img));
            await handleCreateproduct(data);

            navigate("/");

        } catch (error) {
            console.error('Failed to create Product', error);
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div className="lg:h-screen min-h-screen w-full bg-[#0a0a0c] text-gray-200 flex flex-col p-6 lg:p-10 lg:overflow-hidden overflow-y-auto">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-light tracking-wide text-white mb-1.5">Create Product</h1>
                <p className="text-gray-400 text-[11px] tracking-widest uppercase">Add a new piece to your exclusive collection.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                {/* Left Panel: Identity & Valuation */}
                <div className="flex-1 flex flex-col bg-[#121215] p-6 lg:p-8 border border-gray-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-semibold tracking-[0.2em] text-white uppercase">Product Details</h2>
                        <div className="w-12 h-[1px] bg-gray-800"></div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-6">
                        {/* Title */}
                        <div className="relative pt-5">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="peer w-full bg-transparent text-white border-b border-gray-700 px-2 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent text-sm"
                                placeholder="Product Title"
                                required
                            />
                            <label
                                htmlFor="title"
                                className="absolute left-0 top-0 text-gray-500 text-[10px] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-yellow-500 uppercase tracking-widest"
                            >
                                Product Title
                            </label>
                        </div>

                        {/* Description */}
                        <div className="relative pt-5 flex-1 flex flex-col">
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="description-scrollbar peer flex-1 w-full bg-transparent text-white border-b border-gray-700 px-2 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent resize-none text-sm min-h-[100px]"
                                placeholder="Description"
                                required
                            ></textarea>
                            <label
                                htmlFor="description"
                                className="absolute left-0 top-0 text-gray-500 text-[10px] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-yellow-500 uppercase tracking-widest"
                            >
                                Description
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-800/50">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Price Amount */}
                            <div className="relative pt-5 flex-1">
                                <input
                                    type="number"
                                    id="priceAmount"
                                    name="priceAmount"
                                    value={formData.priceAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 px-2 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 placeholder-transparent text-sm"
                                    placeholder="Price Amount"
                                    required
                                />
                                <label
                                    htmlFor="priceAmount"
                                    className="absolute left-0 top-0 text-gray-500 text-[10px] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-yellow-500 uppercase tracking-widest"
                                >
                                    Price Amount
                                </label>
                            </div>

                            {/* Price Currency */}
                            <div className="relative pt-5 sm:w-1/3">
                                <select
                                    id="priceCurrency"
                                    name="priceCurrency"
                                    value={formData.priceCurrency}
                                    onChange={handleChange}
                                    className="peer w-full bg-transparent text-white border-b border-gray-700 px-2 py-2 focus:outline-none focus:border-yellow-500 transition-colors duration-300 appearance-none cursor-pointer text-sm"
                                >
                                    <option value="USD" className="bg-[#121215] text-white">USD ($)</option>
                                    <option value="EUR" className="bg-[#121215] text-white">EUR (€)</option>
                                    <option value="GBP" className="bg-[#121215] text-white">GBP (£)</option>
                                    <option value="INR" className="bg-[#121215] text-white">INR (₹)</option>
                                </select>
                                <label
                                    htmlFor="priceCurrency"
                                    className="absolute left-0 top-0 text-yellow-500 text-[10px] uppercase tracking-widest"
                                >
                                    Currency
                                </label>
                                <div className="absolute right-0 top-6 pointer-events-none text-gray-500 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Media & Submit */}
                <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col bg-[#121215] p-6 lg:p-8 border border-gray-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-semibold tracking-[0.2em] text-white uppercase">Imagery</h2>
                        <span className="text-[10px] font-medium text-gray-500 tracking-[0.2em]">{formData.images.length} / 7</span>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div
                            className={`flex-shrink-0 w-full border border-dashed py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${dragActive ? 'border-yellow-500 bg-[rgba(234,179,8,0.05)]' : 'border-gray-700 hover:border-gray-500 hover:bg-white/[0.02]'} ${formData.images.length >= 7 ? 'opacity-50 pointer-events-none' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('imageUpload').click()}
                        >
                            <svg className={`w-5 h-5 mb-3 ${dragActive ? 'text-yellow-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            <p className="text-[11px] font-light text-gray-400 tracking-wider">
                                {dragActive ? "Drop images here" : "Drag & drop or click"}
                            </p>
                            <input
                                type="file"
                                id="imageUpload"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={formData.images.length >= 7}
                            />
                        </div>

                        {/* Image Previews */}
                        <div className="flex-1 lg:overflow-y-auto mt-6 lg:pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative group aspect-square bg-[#0a0a0c] border border-gray-800 overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/80 text-white p-1 rounded-full backdrop-blur-sm transition-colors duration-200"
                                            >
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-1 left-1 bg-yellow-500 text-black text-[8px] font-bold uppercase tracking-widest px-1 py-0.5">
                                                    Cover
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 lg:mt-4 pt-6 border-t border-gray-800/50 flex-shrink-0">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold uppercase tracking-widest text-[11px] py-3.5 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        >
                            {isSubmitting ? 'Publishing' : "Publish Piece"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;