import React, { useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const Dashboard = () => {
    const { handleGetSellerProduct } = useProduct();
    const sellerProducts = useSelector(state => state.product.sellerProducts);
    const navigate = useNavigate();

    useEffect(() => {
        handleGetSellerProduct();
    }, []);

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
                Seller Atelier // Manage Your Curated Archive &amp; Listings
            </div>

            {/* ── STICKY HEADER ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: 'rgba(251, 249, 246, 0.92)', borderColor: '#e4e2df' }}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <span
                        className="text-2xl sm:text-3xl font-light tracking-[0.32em] uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                    >
                        STITCHD<span style={{ color: '#C9A96E' }}>.</span>
                    </span>

                    {/* Nav actions */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 cursor-pointer"
                            style={{ color: '#7A6E63' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                            onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                            aria-label="Go back"
                        >
                            ← Back
                        </button>

                        <button
                            onClick={() => navigate('/seller/create-product')}
                            className="py-2.5 px-6 text-[10px] uppercase tracking-[0.25em] font-medium transition-all duration-300 cursor-pointer"
                            style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#C9A96E';
                                e.currentTarget.style.color = '#1b1c1a';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '#1b1c1a';
                                e.currentTarget.style.color = '#fbf9f6';
                            }}
                        >
                            + New Listing
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10">

                {/* ── Page Header ── */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        {/* Gold eyebrow label */}
                        <span
                            className="text-[10px] uppercase tracking-[0.3em] font-semibold"
                            style={{ color: '#C9A96E' }}
                        >
                            Seller Archive
                        </span>
                        <h1
                            className="text-4xl lg:text-5xl font-light leading-tight mt-2"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Your Vault
                        </h1>
                        {/* Gold rule */}
                        <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                    </div>

                    {/* Item count badge */}
                    {sellerProducts && sellerProducts.length > 0 && (
                        <span
                            className="text-[10px] uppercase tracking-[0.2em] font-medium px-4 py-2 border self-start md:self-auto"
                            style={{ borderColor: '#e4e2df', color: '#7A6E63', backgroundColor: '#f5f3f0' }}
                        >
                            {sellerProducts.length} {sellerProducts.length === 1 ? 'Piece' : 'Pieces'} in Archive
                        </span>
                    )}
                </div>

                {/* ── Product Grid ── */}
                {sellerProducts && sellerProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 pb-20">
                        {sellerProducts.map(product => {
                            const imageUrl = product.images && product.images.length > 0
                                ? product.images[0].url
                                : '/snitch_editorial_warm.png';

                            const priceDisplay = product.price?.currency === 'INR'
                                ? `₹ ${Number(product.price?.amount || 0).toLocaleString('en-IN')}`
                                : `${product.price?.currency} ${product.price?.amount?.toLocaleString()}`;

                            return (
                                <div
                                    onClick={() => navigate(`/seller/product/${product._id}`)}
                                    key={product._id}
                                    className="group cursor-pointer flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div
                                        className="aspect-[4/5] overflow-hidden mb-4 relative border"
                                        style={{ backgroundColor: '#f5f3f0', borderColor: '#e4e2df' }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={e => { e.currentTarget.src = '/clothing_brand_login.jpg'; }}
                                        />
                                        {/* Hover overlay with "View" label */}
                                        <div
                                            className="absolute inset-0 flex items-end justify-start p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: 'linear-gradient(to top, rgba(27,28,26,0.45) 0%, transparent 60%)' }}
                                        >
                                            <span
                                                className="text-[9px] uppercase tracking-[0.3em] font-medium"
                                                style={{ color: '#fbf9f6' }}
                                            >
                                                View Details →
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex flex-col gap-1.5 px-0.5">
                                        <h3
                                            className="text-lg leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                        >
                                            {product.title}
                                        </h3>

                                        <p
                                            className="text-[11px] line-clamp-2 leading-relaxed"
                                            style={{ color: '#7A6E63' }}
                                        >
                                            {product.description}
                                        </p>

                                        <div className="mt-1.5 flex items-center justify-between">
                                            <span
                                                className="text-[11px] uppercase tracking-[0.15em] font-medium"
                                                style={{ color: '#1b1c1a' }}
                                            >
                                                {priceDisplay}
                                            </span>
                                            {/* Subtle underline indicator on hover */}
                                            <span
                                                className="text-[9px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{ color: '#C9A96E' }}
                                            >
                                                Edit ↗
                                            </span>
                                        </div>

                                        {/* Bottom gold accent line */}
                                        <div
                                            className="h-px mt-1 transition-all duration-300 origin-left"
                                            style={{
                                                backgroundColor: '#C9A96E',
                                                transform: 'scaleX(0)',
                                            }}
                                            ref={el => {
                                                if (el) {
                                                    el.closest('.group').addEventListener('mouseenter', () => el.style.transform = 'scaleX(1)');
                                                    el.closest('.group').addEventListener('mouseleave', () => el.style.transform = 'scaleX(0)');
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Empty State ── */
                    <div className="py-28 text-center flex flex-col items-center">
                        {/* Decorative circle */}
                        <div
                            className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6"
                            style={{ borderColor: '#e4e2df', backgroundColor: '#f5f3f0' }}
                        >
                            <span className="text-2xl" style={{ color: '#C9A96E' }}>✦</span>
                        </div>

                        <span
                            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-4"
                            style={{ color: '#C9A96E' }}
                        >
                            Empty Vault
                        </span>

                        <p
                            className="max-w-md mx-auto text-lg leading-relaxed mb-8"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#7A6E63' }}
                        >
                            You haven't added any curated pieces to your archive yet. Begin by creating a new listing.
                        </p>

                        <button
                            onClick={() => navigate('/seller/create-product')}
                            className="py-4 px-10 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300 cursor-pointer"
                            style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#C9A96E';
                                e.currentTarget.style.color = '#1b1c1a';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '#1b1c1a';
                                e.currentTarget.style.color = '#fbf9f6';
                            }}
                        >
                            + Create First Listing
                        </button>
                    </div>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t" style={{ backgroundColor: '#f5f3f0', borderColor: '#e4e2df' }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em]" style={{ color: '#7A6E63' }}>
                    <p>© 2026 STITCHD Atelier. All Rights Reserved.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="hover:text-[#1b1c1a] transition-colors cursor-pointer"
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

export default Dashboard;