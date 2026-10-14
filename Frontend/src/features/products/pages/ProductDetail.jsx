import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useProduct } from "../hooks/useProduct";

const ProductDetail = () => {
    // 1. Get the productId from the URL route (/product/:productId)
    const { productId } = useParams();
    const navigate = useNavigate();

    // 2. Custom hook providing our API functions
    const { handleGetProductDetailsById } = useProduct();

    // 3. Local state for product data, selected image angle, and loading status
    const [product, setProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [addedToBag, setAddedToBag] = useState(false);

    // 4. Fetch product details when the component mounts or when productId changes
    let isCurrent = true;
    async function fetchProductDetails() {
        setLoading(true);
        setProduct(null);
        try {
            const data = await handleGetProductDetailsById(productId);

            if (isCurrent) {
                setProduct(data ?? null);
            }
        } finally {
            if (isCurrent) {
                setLoading(false);
                isCurrent = false;
            }
        }
    }


    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    console.log("Product details by id fetched:", product);

    // Helper function to format price cleanly
    const formatPrice = (priceObj) => {
        if (!priceObj) return "₹0";
        const amount = Number(priceObj.amount || 0).toLocaleString("en-IN");
        return priceObj.currency === "INR" ? `₹ ${amount}` : `${priceObj.currency} ${amount}`;
    };

    // Feedback for clicking "Add to Bag"
    const handleAddToBag = () => {
        setAddedToBag(true);
        setTimeout(() => setAddedToBag(false), 2500);
    };

    // Handle "Buy Now" action
    const handleBuyNow = () => {

        alert(`Proceeding to checkout for "${product.title}"`);
    };

    // ── LOADING STATE ──

    if (loading) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center text-[#1b1c1a]"
                style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#7A6E63]">
                    Retrieving Atelier Archive Piece...
                </p>
            </div>
        );
    }

    // ── NOT FOUND STATE ──
    if (!product) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center text-[#1b1c1a] px-6 text-center"
                style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
            >
                <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Piece Not Found
                </h2>
                <p className="text-xs text-[#7A6E63] mb-8">
                    The requested piece could not be retrieved from the archive.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="py-3 px-8 text-[11px] uppercase tracking-[0.2em] font-medium bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-colors"
                >
                    Return to Catalog
                </button>
            </div>
        );
    }

    // Extract images safely
    const imagesList = product.images && product.images.length > 0 ? product.images : [];
    const currentImageUrl = imagesList[selectedImageIndex]?.url || imagesList[0]?.url || "/clothing_brand_login.jpg";
    const totalImages = imagesList.length;

    const handlePrevImage = () =>
        setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));

    const handleNextImage = () =>
        setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));

    return (
        <div
            className="min-h-screen selection:bg-[#C9A96E]/30 text-[#1b1c1a]"
            style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
        >
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            {/* ── TOP ANNOUNCEMENT BAR ── */}
            <div
                className="w-full py-2.5 px-4 text-center border-b text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df", color: "#7A6E63" }}
            >
                Curated Archive // Complimentary Express Delivery & Bespoke Tailoring Consultation Across India
            </div>

            {/* ── HEADER / NAVIGATION BAR ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: "rgba(251, 249, 246, 0.92)", borderColor: "#e4e2df" }}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
                    <Link
                        to="/"
                        className="text-2xl sm:text-3xl font-light tracking-[0.32em] uppercase transition-opacity hover:opacity-80"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                    >
                        STITCHD<span style={{ color: "#C9A96E" }}>.</span>
                    </Link>

                    <Link
                        to="/"
                        className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] hover:text-[#1b1c1a] transition-colors"
                    >
                        ← Back to Catalog
                    </Link>
                </div>
            </header>

            {/* ── MAIN PRODUCT DETAIL CONTENT ── */}
            <main className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-6 md:py-8">
                {/* Top Navigation Row: Breadcrumbs & Return to Catalog Button */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#7A6E63] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                    >
                        <span>←</span>
                        <span>Archive Collection</span>
                        <span className="text-[#d0c5b5]">/</span>
                        <span className="text-[#1b1c1a] font-medium">{product.title}</span>
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="py-2 px-4 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#d0c5b5] hover:border-[#1b1c1a] text-[#7A6E63] hover:text-[#1b1c1a] transition-all cursor-pointer"
                    >
                        ← Return to Catalog
                    </button>
                </div>


                {/* 2-Column Product Detail Layout (Matching former popup UI) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

                    {/* ── LEFT: IMAGE GALLERY ── */}
                    <div className="flex gap-3">

                        {/* Vertical Thumbnail Strip */}
                        {totalImages > 1 && (
                            <div
                                className="flex flex-col gap-2 overflow-y-auto flex-shrink-0"
                                style={{ width: "60px", maxHeight: "420px", scrollbarWidth: "thin", scrollbarColor: "#d0c5b5 transparent" }}
                            >
                                {imagesList.map((img, idx) => (
                                    <button
                                        key={img._id || idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`flex-shrink-0 overflow-hidden border transition-all duration-200 cursor-pointer ${
                                            selectedImageIndex === idx
                                                ? "border-[#C9A96E] opacity-100 shadow-sm"
                                                : "border-transparent opacity-50 hover:opacity-90"
                                        }`}
                                        style={{ width: "60px", height: "76px", backgroundColor: "#f2efe9" }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Angle ${idx + 1}`}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image with Prev / Next Arrows */}
                        <div
                            className="relative flex-1 overflow-hidden group"
                            style={{ aspectRatio: "2/3", backgroundColor: "#f2efe9", border: "1px solid #e4e2df" }}
                        >
                            <img
                                src={currentImageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                            />

                            {/* Left Arrow */}
                            {totalImages > 1 && (
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#fbf9f6]/80 hover:bg-[#C9A96E] text-[#1b1c1a] transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                                    style={{ backdropFilter: "blur(4px)" }}
                                    aria-label="Previous image"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}

                            {/* Right Arrow */}
                            {totalImages > 1 && (
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#fbf9f6]/80 hover:bg-[#C9A96E] text-[#1b1c1a] transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                                    style={{ backdropFilter: "blur(4px)" }}
                                    aria-label="Next image"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            )}

                            {/* Dot Indicators */}
                            {totalImages > 1 && (
                                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {imagesList.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`rounded-full transition-all duration-200 cursor-pointer ${
                                                selectedImageIndex === idx
                                                    ? "w-4 h-1.5 bg-[#C9A96E]"
                                                    : "w-1.5 h-1.5 bg-[#fbf9f6]/60 hover:bg-[#fbf9f6]"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: PRODUCT DETAILS & SPECIFICATIONS ── */}
                    <div className="flex flex-col justify-between space-y-5">
                        <div>
                            {/* Gold Badge */}
                            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: "#C9A96E" }}>
                                Piece Identification
                            </span>

                            {/* Product Title */}
                            <h1
                                className="text-2xl sm:text-4xl font-light capitalize mt-1.5 mb-3 leading-tight"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                            >
                                {product.title}
                            </h1>

                            {/* Price */}
                            <p className="text-xl font-medium text-[#1b1c1a] mb-4">
                                {formatPrice(product.price)}
                            </p>

                            {/* Gold Divider Line */}
                            <div className="w-12 h-px mb-4" style={{ backgroundColor: "#C9A96E" }} />

                            {/* Description */}
                            <p className="text-xs font-light text-[#7A6E63] leading-relaxed mb-5">
                                {product.description || "An essential silhouette balancing razor-sharp tailoring with fluid ease. Finished with reinforced seams and signature atelier touches."}
                            </p>

                            {/* Provenance & Atelier Reference Box */}
                            <div
                                className="p-4 text-[10px] space-y-2.5 border mb-5"
                                style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}
                            >
                                <div className="flex justify-between border-b pb-2" style={{ borderColor: "#e4e2df" }}>
                                    <span className="text-[#7A6E63] uppercase tracking-[0.1em]">Provenance</span>
                                    <span className="font-medium text-[#1b1c1a]">Paris & New Delhi Studio</span>
                                </div>
                                <div className="flex justify-between border-b pb-2" style={{ borderColor: "#e4e2df" }}>
                                    <span className="text-[#7A6E63] uppercase tracking-[0.1em]">Atelier Reference</span>
                                    <span className="font-mono text-[#1b1c1a] text-[10px]">{product._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#7A6E63] uppercase tracking-[0.1em]">Garment Care</span>
                                    <span className="text-[#1b1c1a]">Dry Clean Recommended</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2.5 pt-2">
                            {/* Buy Now Button (Replaces former Return button) */}
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-3 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 cursor-pointer bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]"
                            >
                                Buy Now — {formatPrice(product.price)}
                            </button>

                            {/* Add to Shopping Bag Button */}
                            <button
                                onClick={handleAddToBag}
                                className="w-full py-3 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#1b1c1a] text-[#1b1c1a] hover:bg-[#1b1c1a] hover:text-[#fbf9f6] transition-all duration-300 cursor-pointer"
                                style={{
                                    backgroundColor: addedToBag ? "#C9A96E" : "transparent",
                                    color: addedToBag ? "#1b1c1a" : "#1b1c1a",
                                    borderColor: addedToBag ? "#C9A96E" : "#1b1c1a"
                                }}
                            >
                                {addedToBag ? "✓ Added to Shopping Bag" : "+ Add to Shopping Bag"}
                            </button>

                            {/* Secondary Return Link */}
                            <div className="pt-2 text-center">
                                <button
                                    onClick={() => navigate("/")}
                                    className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E63] hover:text-[#1b1c1a] hover:underline underline-offset-4 transition-colors cursor-pointer"
                                >
                                    ← Return to Catalog
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t mt-10" style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-[#7A6E63]">
                    <p>© 2026 STITCHD Atelier. All Rights Reserved.</p>
                    <Link to="/" className="hover:text-[#1b1c1a] transition-colors">
                        Return to Main Collection →
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default ProductDetail;