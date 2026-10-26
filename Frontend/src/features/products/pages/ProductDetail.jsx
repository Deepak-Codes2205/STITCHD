import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useProduct } from "../hooks/useProduct";

// Helper to deduce main product attributes (e.g. Color: "Black") from title/description
const getMainProductAttributes = (product, attrKeys) => {
    if (product.attributes && Object.keys(product.attributes).length > 0) {
        return product.attributes instanceof Map ? Object.fromEntries(product.attributes) : product.attributes;
    }

    const attrs = {};
    const textToSearch = `${product.title || ""} ${product.description || ""}`.toLowerCase();

    const KNOWN_COLORS = [
        "Black", "White", "Brown", "Blue", "Navy", "Green", "Olive", "Grey", "Gray",
        "Beige", "Cream", "Khaki", "Tan", "Charcoal", "Red", "Maroon", "Burgundy",
        "Pink", "Yellow", "Orange", "Purple", "Ivory", "Camel", "Sand", "Rust", "Off-White"
    ];

    const KNOWN_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size", "Regular", "Standard"];
    const KNOWN_FITS = ["Relaxed", "Slim", "Regular", "Wide-Leg", "Oversized", "Straight", "Loose"];

    attrKeys.forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === "color" || lowerKey === "colour") {
            const matchedColor = KNOWN_COLORS.find(c => {
                const regex = new RegExp(`\\b${c.toLowerCase()}\\b`, "i");
                return regex.test(textToSearch);
            });
            attrs[key] = matchedColor || "Black";
        } else if (lowerKey === "size") {
            const matchedSize = KNOWN_SIZES.find(s => {
                const regex = new RegExp(`\\b${s.toLowerCase()}\\b`, "i");
                return regex.test(textToSearch);
            });
            attrs[key] = matchedSize || "Regular";
        } else if (lowerKey === "fit") {
            const matchedFit = KNOWN_FITS.find(f => {
                const regex = new RegExp(`\\b${f.toLowerCase()}\\b`, "i");
                return regex.test(textToSearch);
            });
            attrs[key] = matchedFit || "Standard";
        } else {
            attrs[key] = "Standard";
        }
    });

    return attrs;
};

const ProductDetail = () => {
    // 1. Get the productId from the URL route (/product/:productId)
    const { productId } = useParams();
    const navigate = useNavigate();

    // 2. Custom hook providing API functions
    const { handleGetProductDetailsById, handleGetProductById } = useProduct();

    // 3. Local state
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [loading, setLoading] = useState(true);
    const [addedToBag, setAddedToBag] = useState(false);

    // 4. Fetch product details safely on mount or when productId changes
    useEffect(() => {
        let isCurrent = true;

        async function fetchProductDetails() {
            setLoading(true);
            try {
                const fetchFn = handleGetProductDetailsById || handleGetProductById;
                const data = await fetchFn(productId);
                if (isCurrent) {
                    setProduct(data?.product || data || null);
                }
            } catch (error) {
                console.error("Failed to fetch product details:", error);
                if (isCurrent) {
                    setProduct(null);
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        }

        fetchProductDetails();

        return () => {
            isCurrent = false;
        };
    }, [productId]);

    // 5. Build complete variants list including the main/base product
    const allVariants = useMemo(() => {
        if (!product) return [];
        const variants = product.variants || [];

        // If no variants exist, product stands alone
        if (variants.length === 0) return [];

        // Collect all attribute keys used across variants
        const attrKeysSet = new Set();
        variants.forEach(v => {
            const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
            Object.keys(vAttrs).forEach(k => attrKeysSet.add(k));
        });

        const attrKeysArray = Array.from(attrKeysSet);
        if (attrKeysArray.length === 0) return variants;

        // Derive attributes for the main product (e.g. Color: "Black")
        const mainAttrs = getMainProductAttributes(product, attrKeysArray);

        // Check if main product is already present in variants list
        const alreadyExists = variants.some(v => {
            const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
            return attrKeysArray.every(k =>
                String(vAttrs[k] || "").trim().toLowerCase() === String(mainAttrs[k] || "").trim().toLowerCase()
            );
        });

        if (alreadyExists) {
            return variants;
        }

        // Create base variant representing the original main product
        const mainVariant = {
            _id: product._id,
            isMainProduct: true,
            price: product.price,
            images: product.images,
            image: product.images,
            stock: product.stock !== undefined ? product.stock : null,
            attributes: mainAttrs,
            title: product.title,
            description: product.description
        };

        // Main product first so it is default
        return [mainVariant, ...variants];
    }, [product]);

    // 6. Aggregate available distinct attributes from all variants (including main product)
    const availableAttributes = useMemo(() => {
        if (!allVariants || allVariants.length === 0) return {};
        const attrs = {};
        allVariants.forEach(variant => {
            if (variant.attributes) {
                const vAttrs = variant.attributes instanceof Map
                    ? Object.fromEntries(variant.attributes)
                    : variant.attributes;
                Object.entries(vAttrs).forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    attrs[key].add(value);
                });
            }
        });
        const result = {};
        Object.keys(attrs).forEach(key => {
            result[key] = Array.from(attrs[key]);
        });
        return result;
    }, [allVariants]);

    // 7. Initialize selected attributes with the first variant (main product)
    useEffect(() => {
        if (allVariants.length > 0) {
            const firstVariant = allVariants[0];
            const initialAttrs = firstVariant.attributes instanceof Map
                ? Object.fromEntries(firstVariant.attributes)
                : (firstVariant.attributes || {});
            setSelectedAttributes(initialAttrs);
        } else {
            setSelectedAttributes({});
        }
    }, [allVariants]);

    // 8. Find active variant that matches selectedAttributes
    const activeVariant = useMemo(() => {
        if (!allVariants || allVariants.length === 0) return null;
        return allVariants.find(v => {
            if (!v.attributes) return false;
            const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
            const vKeys = Object.keys(vAttrs);
            const sKeys = Object.keys(selectedAttributes);
            const isMatch = vKeys.every(k => String(vAttrs[k] || "").trim().toLowerCase() === String(selectedAttributes[k] || "").trim().toLowerCase());
            return vKeys.length === sKeys.length && isMatch;
        }) || allVariants[0];
    }, [allVariants, selectedAttributes]);

    // 9. Reset selected image whenever activeVariant changes
    useEffect(() => {
        setSelectedImage(0);
    }, [activeVariant]);

    // 10. Handle attribute change with exact match or best fallback
    const handleAttributeChange = (attrName, value) => {
        const newAttrs = { ...selectedAttributes, [attrName]: value };

        // 1. Try exact match in allVariants
        const exactMatch = allVariants.find(v => {
            const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
            const vKeys = Object.keys(vAttrs);
            const newKeys = Object.keys(newAttrs);
            return newKeys.every(k => String(newAttrs[k] || "").trim().toLowerCase() === String(vAttrs[k] || "").trim().toLowerCase()) &&
                vKeys.every(k => String(newAttrs[k] || "").trim().toLowerCase() === String(vAttrs[k] || "").trim().toLowerCase());
        });

        if (exactMatch) {
            const exactAttrs = exactMatch.attributes instanceof Map
                ? Object.fromEntries(exactMatch.attributes)
                : (exactMatch.attributes || {});
            setSelectedAttributes(exactAttrs);
        } else {
            // 2. Fallback to any variant having this attribute value
            const fallbackVariant = allVariants.find(v => {
                const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
                return String(vAttrs[attrName] || "").trim().toLowerCase() === String(value).trim().toLowerCase();
            });
            if (fallbackVariant) {
                const fbAttrs = fallbackVariant.attributes instanceof Map
                    ? Object.fromEntries(fallbackVariant.attributes)
                    : (fallbackVariant.attributes || {});
                setSelectedAttributes(fbAttrs);
            } else {
                setSelectedAttributes(newAttrs);
            }
        }
    };

    // ── FALLBACK TO MAIN PRODUCT VALUE RESOLUTION ──
    // Images: check variant's 'images' or 'image' array; fallback to product.images
    const variantImages = (activeVariant?.images && activeVariant.images.length > 0)
        ? activeVariant.images
        : (activeVariant?.image && activeVariant.image.length > 0 ? activeVariant.image : null);

    const displayImages = (variantImages && variantImages.length > 0)
        ? variantImages
        : (product?.images && product.images.length > 0 ? product.images : [{ url: "/clothing_brand_login.jpg" }]);

    // Price: check activeVariant.price; fallback to product.price
    const displayPrice = (activeVariant?.price?.amount !== undefined && activeVariant?.price?.amount !== null && activeVariant?.price?.amount !== "")
        ? activeVariant.price
        : product?.price;

    // Stock: check activeVariant.stock; fallback to product.stock
    const displayStock = (activeVariant && activeVariant.stock !== undefined && activeVariant.stock !== null)
        ? activeVariant.stock
        : (product?.stock !== undefined ? product.stock : null);

    // Title & Description fallback
    const displayTitle = activeVariant?.title || product?.title || "Archive Piece";
    const displayDescription = activeVariant?.description || product?.description || "An essential silhouette balancing razor-sharp tailoring with fluid ease. Finished with reinforced seams and signature atelier touches.";

    // Price formatting helper
    const formatPriceDisplay = (priceObj) => {
        if (!priceObj) return "INR 0";
        const curr = priceObj.currency || "INR";
        const amt = Number(priceObj.amount || 0).toLocaleString("en-IN");
        return `${curr} ${amt}`;
    };

    const isOutOfStock = displayStock !== null && displayStock !== undefined && Number(displayStock) <= 0;

    // Handle "Add to Bag"
    const handleAddToBag = () => {
        setAddedToBag(true);
        setTimeout(() => setAddedToBag(false), 2500);
    };

    // Handle "Buy Now"
    const handleBuyNow = () => {
        const specSummary = Object.keys(selectedAttributes).length > 0
            ? ` (${Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")})`
            : "";
        alert(`Proceeding to checkout for "${displayTitle}"${specSummary} — ${formatPriceDisplay(displayPrice)}`);
    };

    // ── LOADING STATE ──
    if (loading) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center text-[#1b1c1a]"
                style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#7A6E63] font-medium animate-pulse">
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
                    className="py-3 px-8 text-[11px] uppercase tracking-[0.2em] font-medium bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                >
                    Return to Catalog
                </button>
            </div>
        );
    }

    const totalImages = displayImages.length;
    const currentImageObj = displayImages[selectedImage] || displayImages[0];
    const currentImageUrl = typeof currentImageObj === "string" ? currentImageObj : (currentImageObj?.url || "/clothing_brand_login.jpg");

    return (
        <div
            className="min-h-screen selection:bg-[#C9A96E]/30 text-[#1b1c1a] pb-20"
            style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
        >
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            {/* ── HEADER / NAVIGATION BAR ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: "rgba(251, 249, 246, 0.94)", borderColor: "#e4e2df" }}
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

            {/* ── MAIN PRODUCT CONTENT ── */}
            <main className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 pt-8 lg:pt-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 xl:gap-16 items-start justify-between">

                    {/* ── LEFT: IMAGE GALLERY (Thumbnails on Left + Main Image) ── */}
                    <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col-reverse md:flex-row gap-3.5 max-w-[460px] mx-auto lg:mx-0">

                        {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
                        {totalImages > 1 && (
                            <div className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-16 flex-shrink-0 md:max-h-[480px]">
                                {displayImages.map((img, idx) => {
                                    const thumbUrl = typeof img === "string" ? img : (img?.url || "/clothing_brand_login.jpg");
                                    const isCurrent = selectedImage === idx;
                                    return (
                                        <button
                                            key={img?._id || idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-16 md:w-full aspect-[3/4] overflow-hidden transition-all duration-300 border cursor-pointer ${
                                                isCurrent
                                                    ? "opacity-100 border-[#1b1c1a] shadow-sm ring-1 ring-[#1b1c1a]"
                                                    : "opacity-60 hover:opacity-100 border-[#e4e2df]"
                                            }`}
                                            style={{ backgroundColor: "#f5f3f0" }}
                                        >
                                            <img
                                                src={thumbUrl}
                                                alt={`View ${idx + 1}`}
                                                className="w-full h-full object-cover object-top"
                                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Main Image (Reduced, compact size) */}
                        <div
                            className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden group flex-1"
                            style={{ backgroundColor: "#f5f3f0", border: "1px solid #e4e2df" }}
                        >
                            <img
                                src={currentImageUrl}
                                alt={displayTitle}
                                className="w-full h-full object-cover object-top transition-all duration-500"
                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                            />

                            {/* Left / Right Carousel Arrow Controls */}
                            {totalImages > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === 0 ? totalImages - 1 : prev - 1)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border cursor-pointer shadow-sm"
                                        style={{ backgroundColor: "rgba(251,249,246,0.85)", borderColor: "#e4e2df", color: "#1b1c1a" }}
                                        aria-label="Previous image"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === totalImages - 1 ? 0 : prev + 1)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border cursor-pointer shadow-sm"
                                        style={{ backgroundColor: "rgba(251,249,246,0.85)", borderColor: "#e4e2df", color: "#1b1c1a" }}
                                        aria-label="Next image"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: PRODUCT DETAILS & VARIANT SELECTION ── */}
                    <div className="w-full lg:w-[52%] xl:w-[54%] lg:sticky lg:top-24 flex flex-col">

                        {/* Title */}
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.08] mb-4 text-[#1b1c1a]"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            {displayTitle}
                        </h1>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-sm uppercase tracking-[0.2em] font-medium text-[#1b1c1a]">
                                {formatPriceDisplay(displayPrice)}
                            </span>
                        </div>

                        {/* Divider Line */}
                        <div className="h-px w-full mb-8" style={{ backgroundColor: "#e4e2df" }} />

                        {/* ── DYNAMIC VARIANT ATTRIBUTE SELECTORS (Color, Size, etc.) ── */}
                        {Object.entries(availableAttributes).map(([attrName, values]) => (
                            <div key={attrName} className="mb-6">
                                <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold mb-3 text-[#7A6E63]">
                                    {attrName}
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {values.map(val => {
                                        const isSelected = String(selectedAttributes[attrName] || "").trim().toLowerCase() === String(val).trim().toLowerCase();
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => handleAttributeChange(attrName, val)}
                                                className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] font-medium transition-all duration-200 border cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#1b1c1a] bg-[#1b1c1a] text-[#fbf9f6] shadow-sm"
                                                        : "border-[#d0c5b5] text-[#1b1c1a] hover:border-[#1b1c1a] bg-transparent"
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Stock Information */}
                        <div className="mb-6">
                            <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${
                                displayStock === null || displayStock > 0 ? "text-[#1b1c1a]" : "text-red-700"
                            }`}>
                                {displayStock !== null && displayStock !== undefined
                                    ? (displayStock > 0 ? `${displayStock} IN STOCK` : "OUT OF STOCK")
                                    : "IN STOCK"}
                            </span>
                        </div>

                        {/* The Details */}
                        <div className="mb-10">
                            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold mb-3 text-[#7A6E63]">
                                THE DETAILS
                            </h3>
                            <p className="text-xs md:text-sm font-light leading-relaxed text-[#7A6E63] whitespace-pre-line">
                                {displayDescription}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3.5">
                            {/* Add to Cart Button */}
                            <button
                                type="button"
                                onClick={handleAddToBag}
                                disabled={isOutOfStock}
                                className={`w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 ${
                                    isOutOfStock
                                        ? "bg-[#e4e2df] text-[#a59e95] cursor-not-allowed"
                                        : "cursor-pointer bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]"
                                }`}
                                style={{
                                    backgroundColor: addedToBag ? "#C9A96E" : undefined,
                                    color: addedToBag ? "#1b1c1a" : undefined
                                }}
                            >
                                {addedToBag ? "✓ Added to Cart" : (isOutOfStock ? "Out of Stock" : "ADD TO CART")}
                            </button>

                            {/* Buy Now Button */}
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className={`w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 border ${
                                    isOutOfStock
                                        ? "border-[#e4e2df] text-[#a59e95] cursor-not-allowed bg-transparent"
                                        : "border-[#1b1c1a] text-[#1b1c1a] hover:bg-[#1b1c1a] hover:text-[#fbf9f6] bg-transparent cursor-pointer"
                                }`}
                            >
                                BUY NOW
                            </button>
                        </div>

                        {/* Extra Guarantees / Specifications */}
                        <div className="mt-12 space-y-3.5 text-[10px] uppercase tracking-[0.14em] text-[#7A6E63] border-t pt-6" style={{ borderColor: "#e4e2df" }}>
                            <div className="flex justify-between border-b pb-3" style={{ borderColor: "#e4e2df" }}>
                                <span>Shipping</span>
                                <span>Complimentary over INR 15,000</span>
                            </div>
                            <div className="flex justify-between border-b pb-3" style={{ borderColor: "#e4e2df" }}>
                                <span>Returns</span>
                                <span>Within 14 days of delivery</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Authenticity</span>
                                <span>100% Guaranteed</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t mt-20" style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}>
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