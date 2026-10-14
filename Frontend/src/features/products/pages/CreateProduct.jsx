import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const MAX_IMAGES = 7;

const CreateProduct = () => {
    const { handleCreateProduct } = useProduct();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR',
    });
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addFiles = (files) => {
        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) return;
        const toAdd = Array.from(files).slice(0, remaining);
        const newImages = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleFileChange = (e) => {
        addFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    }, [images]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('priceAmount', formData.priceAmount);
            data.append('priceCurrency', formData.priceCurrency);
            images.forEach(img => data.append('images', img.file));
            await handleCreateProduct(data);
            navigate('/');
        } catch (err) {
            console.error('Failed to create product', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Shared input styles ──
    const inputBase = "w-full bg-transparent outline-none py-3.5 text-sm transition-colors duration-300 placeholder:text-[#d0c5b5]";
    const inputStyle = { color: '#1b1c1a', borderBottom: '1px solid #d0c5b5', fontFamily: "'Inter', sans-serif" };
    const handleFocus = (e) => { e.target.style.borderBottomColor = '#C9A96E'; };
    const handleBlur  = (e) => { e.target.style.borderBottomColor = '#d0c5b5'; };

    return (
        <div
            className="min-h-screen selection:bg-[#C9A96E]/30 text-[#1b1c1a]"
            style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
        >
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            {/* ── TOP ANNOUNCEMENT BAR ── */}
            <div
                className="w-full py-2.5 px-4 text-center border-b text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ backgroundColor: '#f5f3f0', borderColor: '#e4e2df', color: '#7A6E63' }}
            >
                Seller Atelier // Add a New Piece to Your Curated Archive
            </div>

            {/* ── STICKY HEADER ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: 'rgba(251, 249, 246, 0.92)', borderColor: '#e4e2df' }}
            >
                <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <span
                        className="text-2xl sm:text-3xl font-light tracking-[0.32em] uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                    >
                        STITCHD<span style={{ color: '#C9A96E' }}>.</span>
                    </span>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 cursor-pointer"
                        style={{ color: '#7A6E63' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                        aria-label="Go back"
                    >
                        ← Back to Vault
                    </button>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10">

                {/* ── Page Header ── */}
                <div className="mb-10">
                    <span
                        className="text-[10px] uppercase tracking-[0.3em] font-semibold"
                        style={{ color: '#C9A96E' }}
                    >
                        New Listing
                    </span>
                    <h1
                        className="text-4xl lg:text-5xl font-light leading-tight mt-2"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                    >
                        Publish a Piece
                    </h1>
                    <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 lg:items-start">

                        {/* ── LEFT COLUMN: Text Fields ── */}
                        <div className="flex flex-col gap-10">

                            {/* Section label */}
                            <div
                                className="pb-3 text-[9px] uppercase tracking-[0.3em] font-semibold border-b"
                                style={{ color: '#C9A96E', borderColor: '#e4e2df' }}
                            >
                                Piece Information
                            </div>

                            {/* Product Title */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="cp-title"
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                    style={{ color: '#7A6E63' }}
                                >
                                    Product Title
                                </label>
                                <input
                                    id="cp-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Oversized Linen Shirt"
                                    className={inputBase}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="cp-description"
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                    style={{ color: '#7A6E63' }}
                                >
                                    Description
                                </label>
                                <textarea
                                    id="cp-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Describe the product — material, fit, details..."
                                    className="w-full bg-transparent outline-none py-3.5 text-sm transition-colors duration-300 resize-none leading-relaxed placeholder:text-[#d0c5b5]"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col gap-3">
                                <label
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                    style={{ color: '#7A6E63' }}
                                >
                                    Price
                                </label>
                                <div className="flex gap-5 items-end">
                                    {/* Amount */}
                                    <div className="flex flex-col gap-1 flex-[3]">
                                        <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: '#B5ADA3' }}>Amount</span>
                                        <input
                                            id="cp-priceAmount"
                                            type="number"
                                            name="priceAmount"
                                            value={formData.priceAmount}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className={inputBase}
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    {/* Currency */}
                                    <div className="flex flex-col gap-1 flex-[1]">
                                        <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: '#B5ADA3' }}>Currency</span>
                                        <select
                                            id="cp-priceCurrency"
                                            name="priceCurrency"
                                            value={formData.priceCurrency}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none py-3.5 text-sm cursor-pointer appearance-none transition-colors duration-300"
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c} value={c} style={{ backgroundColor: '#fbf9f6', color: '#1b1c1a' }}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Atelier note box */}
                            <div
                                className="p-4 text-[10px] space-y-1.5 border"
                                style={{ backgroundColor: '#f5f3f0', borderColor: '#e4e2df' }}
                            >
                                <p className="uppercase tracking-[0.15em] font-medium" style={{ color: '#C9A96E' }}>Atelier Note</p>
                                <p className="leading-relaxed" style={{ color: '#7A6E63' }}>
                                    All listed pieces are subject to quality review. Ensure images are high-resolution and description is accurate.
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN: Images ── */}
                        <div className="flex flex-col gap-5">

                            {/* Section label + counter */}
                            <div
                                className="pb-3 flex items-center justify-between border-b"
                                style={{ borderColor: '#e4e2df' }}
                            >
                                <span
                                    className="text-[9px] uppercase tracking-[0.3em] font-semibold"
                                    style={{ color: '#C9A96E' }}
                                >
                                    Archive Images
                                </span>
                                <span
                                    className="text-[10px] tabular-nums font-medium px-2.5 py-1 border"
                                    style={{ color: '#7A6E63', borderColor: '#e4e2df', backgroundColor: '#f5f3f0' }}
                                >
                                    {images.length} / {MAX_IMAGES}
                                </span>
                            </div>

                            {/* Drop Zone */}
                            {images.length < MAX_IMAGES && (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-dashed px-8 py-14 lg:py-16 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
                                    style={{
                                        borderColor: isDragging ? '#C9A96E' : '#d0c5b5',
                                        backgroundColor: isDragging ? 'rgba(201,169,110,0.05)' : 'transparent'
                                    }}
                                >
                                    {/* Upload icon */}
                                    <div
                                        className="w-10 h-10 flex items-center justify-center border transition-colors duration-300"
                                        style={{
                                            borderColor: isDragging ? '#C9A96E' : '#d0c5b5',
                                            color: isDragging ? '#C9A96E' : '#B5ADA3'
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                            Drop images here or{' '}
                                            <span style={{ color: '#C9A96E', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                                                tap to upload
                                            </span>
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.15em] mt-2" style={{ color: '#B5ADA3' }}>
                                            Up to {MAX_IMAGES} images · JPG, PNG, WEBP
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-1">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square overflow-hidden group border"
                                            style={{ backgroundColor: '#eae8e5', borderColor: '#e4e2df' }}
                                        >
                                            <img
                                                src={img.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Index badge */}
                                            {index === 0 && (
                                                <span
                                                    className="absolute top-1.5 left-1.5 text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 font-medium"
                                                    style={{ backgroundColor: '#C9A96E', color: '#1b1c1a' }}
                                                >
                                                    Cover
                                                </span>
                                            )}
                                            {/* Remove overlay */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-medium tracking-[0.2em] uppercase"
                                                style={{ backgroundColor: 'rgba(27,28,26,0.6)', color: '#fbf9f6' }}
                                                aria-label={`Remove image ${index + 1}`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Submit Button ── */}
                    <div className="mt-14 border-t pt-10" style={{ borderColor: '#e4e2df' }}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#B5ADA3' }}>
                                Review your listing before publishing
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-14 py-4 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{
                                    backgroundColor: isSubmitting ? '#7A6E63' : '#1b1c1a',
                                    color: '#fbf9f6',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onMouseEnter={e => {
                                    if (!isSubmitting) {
                                        e.currentTarget.style.backgroundColor = '#C9A96E';
                                        e.currentTarget.style.color = '#1b1c1a';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isSubmitting) {
                                        e.currentTarget.style.backgroundColor = '#1b1c1a';
                                        e.currentTarget.style.color = '#fbf9f6';
                                    }
                                }}
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t" style={{ backgroundColor: '#f5f3f0', borderColor: '#e4e2df' }}>
                <div
                    className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: '#7A6E63' }}
                >
                    <p>© 2026 STITCHD Atelier. All Rights Reserved.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="transition-colors cursor-pointer"
                        style={{ color: '#7A6E63' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                    >
                        Return to Main Collection →
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CreateProduct;