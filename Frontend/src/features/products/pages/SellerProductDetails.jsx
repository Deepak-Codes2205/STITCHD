import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useProduct } from "../hooks/useProduct";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const ATTRIBUTE_SUGGESTIONS = ["Color", "Size", "Storage", "Voltage", "Material", "Style"];
const MAX_VARIANT_IMAGES = 7;

const SellerProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    // Custom hook providing API functions
    const {
        handleGetProductDetailsById,
        handleAddProductVariant,
        handleUpdateProductVariantStock,
        handleDeleteProductVariant
    } = useProduct();

    // ── Local State ──
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // ── Master Product Image Carousel & Swipe State ──
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [dragStartX, setDragStartX] = useState(null);
    const [copiedId, setCopiedId] = useState(false);

    // Filter & Search state for variants
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
    const [searchQuery, setSearchQuery] = useState('');

    // ── New Variant Form State ──
    const [variantPrice, setVariantPrice] = useState({ amount: '', currency: 'INR' });
    const [variantStock, setVariantStock] = useState(0);

    // Multi-Image Upload from Device (Max 7 images)
    const [variantImages, setVariantImages] = useState([]); // [{ file, preview }]
    const [isDragging, setIsDragging] = useState(false);
    const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(null);
    const fileInputRef = useRef(null);

    // Dynamic attributes array: e.g. [{ key: 'Color', value: 'Black' }, { key: 'Size', value: 'UK 9' }]
    const [attributesList, setAttributesList] = useState([
        { key: 'Color', value: '' },
        { key: 'Size', value: '' }
    ]);

    // Track unsaved local stock changes for smooth live editing
    const [localStockMap, setLocalStockMap] = useState({});
    const [updatingStockId, setUpdatingStockId] = useState(null);

    // Show temporary toast notification
    const triggerToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3500);
    };

    // ── Fetch Product Details ──
    async function fetchProductDetails() {
        setLoading(true);
        try {
            const data = await handleGetProductDetailsById(productId);
            if (data) {
                setProduct(data);
                // Pre-fill default price from parent product
                setVariantPrice({
                    amount: data.price?.amount || '',
                    currency: data.price?.currency || 'INR'
                });
                // Initialize local stock map
                const initialStocks = {};
                (data.variants || []).forEach(v => {
                    initialStocks[v._id] = v.stock;
                });
                setLocalStockMap(initialStocks);
            }
        } catch (err) {
            console.error("Failed to load product details", err);
            triggerToast("Unable to load product archive", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
        }
    }, [productId]);

    // ── Helper: Format Currency ──
    const formatPrice = (amount, currency = 'INR') => {
        const num = Number(amount || 0).toLocaleString('en-IN');
        return currency === 'INR' ? `₹ ${num}` : `${currency} ${num}`;
    };

    // ── Device Multi-Image Handlers (Max 7) ──
    const addImageFiles = (files) => {
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_VARIANT_IMAGES - variantImages.length;
        if (remainingSlots <= 0) {
            triggerToast(`Maximum ${MAX_VARIANT_IMAGES} images allowed per variant.`, "error");
            return;
        }

        const validFiles = [];
        for (let i = 0; i < files.length && validFiles.length < remainingSlots; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                triggerToast(`"${file.name}" is not a valid image format.`, "error");
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                triggerToast(`"${file.name}" exceeds the 5MB size limit.`, "error");
                continue;
            }
            validFiles.push({
                file,
                preview: URL.createObjectURL(file)
            });
        }

        if (validFiles.length > 0) {
            setVariantImages(prev => [...prev, ...validFiles]);
            setSelectedGalleryIndex(null); // Clear master gallery pick if device files added
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files) {
            addImageFiles(Array.from(e.target.files));
        }
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer?.files) {
            addImageFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemoveImage = (indexToRemove) => {
        setVariantImages(prev => {
            const item = prev[indexToRemove];
            if (item?.preview) {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    const handleClearAllImages = () => {
        variantImages.forEach(img => {
            if (img.preview) URL.revokeObjectURL(img.preview);
        });
        setVariantImages([]);
    };

    const handleSelectGalleryImage = (idx) => {
        handleClearAllImages();
        setSelectedGalleryIndex(idx);
    };

    // ── Dynamic Attribute Handlers ──
    const handleAddAttributeField = (suggestedKey = '') => {
        setAttributesList(prev => [...prev, { key: suggestedKey, value: '' }]);
    };

    const handleUpdateAttribute = (index, field, value) => {
        setAttributesList(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleRemoveAttribute = (index) => {
        setAttributesList(prev => prev.filter((_, i) => i !== index));
    };

    // ── Handle Add New Variant ──
    const handleCreateVariant = async (e) => {
        e.preventDefault();

        // 1. Validate attributes
        const validAttributes = {};
        for (const item of attributesList) {
            const cleanKey = item.key.trim();
            const cleanVal = item.value.trim();
            if (cleanKey && cleanVal) {
                validAttributes[cleanKey] = cleanVal;
            }
        }

        if (Object.keys(validAttributes).length === 0) {
            triggerToast("Please provide at least one valid attribute (e.g., Color or Size).", "error");
            return;
        }

        // 2. Validate price
        if (!variantPrice.amount || Number(variantPrice.amount) <= 0) {
            triggerToast("Please specify a valid price amount.", "error");
            return;
        }

        // 3. Stock defaults to 0, images are optional
        const stockNum = variantStock === '' ? 0 : Math.max(0, parseInt(variantStock, 10) || 0);

        // 4. Build FormData with device images (if provided) or gallery image (if selected)
        const formData = new FormData();

        if (variantImages.length > 0) {
            variantImages.forEach(img => {
                formData.append('images', img.file);
            });
        } else if (selectedGalleryIndex !== null && product.images?.[selectedGalleryIndex]) {
            formData.append('image', product.images[selectedGalleryIndex].url);
        }

        formData.append('stock', stockNum);
        formData.append('attributes', JSON.stringify(validAttributes));
        formData.append('price', JSON.stringify({
            amount: String(variantPrice.amount),
            currency: variantPrice.currency || 'INR'
        }));

        setActionLoading(true);
        try {
            const updatedProduct = await handleAddProductVariant(productId, formData);
            if (updatedProduct) {
                setProduct(updatedProduct);
                // Update local stocks
                const newStocks = { ...localStockMap };
                (updatedProduct.variants || []).forEach(v => {
                    newStocks[v._id] = v.stock;
                });
                setLocalStockMap(newStocks);
            } else {
                await fetchProductDetails();
            }

            triggerToast("Variant created successfully!");

            // Reset dynamic fields and uploaded files
            handleClearAllImages();
            setSelectedGalleryIndex(null);
            setVariantStock(0);
            setAttributesList([
                { key: 'Color', value: '' },
                { key: 'Size', value: '' }
            ]);
        } catch (err) {
            console.error("Failed to add variant", err);
            triggerToast("Failed to create variant. Please verify fields.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Handle Stock Steppers / Update ──
    const handleStockChange = (variantId, newQty) => {
        const sanitized = Math.max(0, parseInt(newQty, 10) || 0);
        setLocalStockMap(prev => ({
            ...prev,
            [variantId]: sanitized
        }));
    };

    const handleSaveVariantStock = async (variantId) => {
        const updatedQty = localStockMap[variantId] ?? 0;
        setUpdatingStockId(variantId);
        try {
            const updatedProduct = await handleUpdateProductVariantStock(productId, variantId, updatedQty);
            if (updatedProduct) {
                setProduct(updatedProduct);
            } else {
                setProduct(prev => ({
                    ...prev,
                    variants: prev.variants.map(v => v._id === variantId ? { ...v, stock: updatedQty } : v)
                }));
            }
            triggerToast(`Stock updated to ${updatedQty} units`);
        } catch (err) {
            console.error("Failed to update stock", err);
            triggerToast("Failed to save stock update", "error");
        } finally {
            setUpdatingStockId(null);
        }
    };

    // ── Handle Delete Variant ──
    const handleDeleteVariant = async (variantId) => {
        if (!window.confirm("Are you sure you want to remove this variant from inventory?")) return;

        setActionLoading(true);
        try {
            const updatedProduct = await handleDeleteProductVariant(productId, variantId);
            if (updatedProduct) {
                setProduct(updatedProduct);
            } else {
                setProduct(prev => ({
                    ...prev,
                    variants: prev.variants.filter(v => v._id !== variantId)
                }));
            }
            triggerToast("Variant removed from archive");
        } catch (err) {
            console.error("Failed to delete variant", err);
            triggerToast("Failed to delete variant", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Loading Skeleton ──
    if (loading) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center text-[#1b1c1a]"
                style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs uppercase tracking-[0.25em] text-[#7A6E63]">
                    Loading Atelier Product Archive...
                </p>
            </div>
        );
    }

    // ── Not Found State ──
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
                    The requested piece could not be found in your seller vault.
                </p>
                <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="py-3 px-8 text-[11px] uppercase tracking-[0.2em] font-medium bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Calculated Variant Metrics
    const variantsList = product.variants || [];
    const totalVariantsCount = variantsList.length;
    const totalStockCount = variantsList.reduce((acc, curr) => acc + (localStockMap[curr._id] ?? curr.stock ?? 0), 0);
    const lowStockCount = variantsList.filter(v => {
        const s = localStockMap[v._id] ?? v.stock ?? 0;
        return s > 0 && s <= 5;
    }).length;
    const outOfStockCount = variantsList.filter(v => (localStockMap[v._id] ?? v.stock ?? 0) === 0).length;

    // Filtered variants
    const filteredVariants = variantsList.filter(variant => {
        const curStock = localStockMap[variant._id] ?? variant.stock ?? 0;
        if (statusFilter === 'IN_STOCK' && curStock <= 0) return false;
        if (statusFilter === 'LOW_STOCK' && (curStock <= 0 || curStock > 5)) return false;
        if (statusFilter === 'OUT_OF_STOCK' && curStock !== 0) return false;

        // Search query filter across attribute keys & values
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const attrMatch = Object.entries(variant.attributes || {}).some(
                ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
            );
            const priceMatch = String(variant.price?.amount || '').includes(q);
            return attrMatch || priceMatch;
        }
        return true;
    });

    // ── Master Product Imagery & Swipe Engine ──
    const masterImages = product?.images && product.images.length > 0 ? product.images : [];
    const totalMasterImages = masterImages.length;
    const safeHeroIndex = totalMasterImages > 0
        ? ((heroImageIndex % totalMasterImages) + totalMasterImages) % totalMasterImages
        : 0;
    const activeHeroImgUrl = masterImages[safeHeroIndex]?.url || "/clothing_brand_login.jpg";

    const handlePrevMasterImage = (e) => {
        if (e) e.stopPropagation();
        if (totalMasterImages <= 1) return;
        setHeroImageIndex(prev => (prev === 0 ? totalMasterImages - 1 : prev - 1));
    };

    const handleNextMasterImage = (e) => {
        if (e) e.stopPropagation();
        if (totalMasterImages <= 1) return;
        setHeroImageIndex(prev => (prev === totalMasterImages - 1 ? 0 : prev + 1));
    };

    // Touch Swipe Handlers (Left/Right)
    const handleTouchStart = (e) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const diffX = touchStartX - touchEndX;
        const minSwipeDistance = 40;
        if (diffX > minSwipeDistance) {
            handleNextMasterImage();
        } else if (diffX < -minSwipeDistance) {
            handlePrevMasterImage();
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    // Mouse Drag Swipe Handlers
    const handleMouseDown = (e) => {
        setDragStartX(e.clientX);
    };

    const handleMouseUp = (e) => {
        if (dragStartX === null) return;
        const diffX = dragStartX - e.clientX;
        const minDragDistance = 50;
        if (diffX > minDragDistance) {
            handleNextMasterImage();
        } else if (diffX < -minDragDistance) {
            handlePrevMasterImage();
        }
        setDragStartX(null);
    };

    // Helper: Copy product ID
    const handleCopyProductId = () => {
        if (!product?._id) return;
        navigator.clipboard?.writeText(product._id);
        setCopiedId(true);
        triggerToast("Product Spec ID copied to clipboard!");
        setTimeout(() => setCopiedId(false), 2500);
    };

    // Helper: Format Archive Date
    const formatArchiveDate = (dateStr) => {
        if (!dateStr) return "Archive Original";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "Archive Original";
            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return "Archive Original";
        }
    };

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

            {/* ── TOP TOAST NOTIFICATION ── */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 px-5 py-3 border text-xs uppercase tracking-wider font-medium shadow-lg transition-all duration-300 flex items-center gap-3 ${notification.type === 'error'
                        ? 'bg-[#ffebee] border-[#ffcdd2] text-[#c62828]'
                        : 'bg-[#1b1c1a] border-[#C9A96E] text-[#fbf9f6]'
                        }`}
                >
                    <span className="text-[#C9A96E]">✦</span>
                    <span>{notification.message}</span>
                </div>
            )}

            {/* ── TOP ANNOUNCEMENT BAR ── */}
            <div
                className="w-full py-2.5 px-4 text-center border-b text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df", color: "#7A6E63" }}
            >
                Seller Atelier // Spec No. {product._id?.slice(-6).toUpperCase()} · Variant & Inventory Control
            </div>

            {/* ── STICKY HEADER ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: "rgba(251, 249, 246, 0.92)", borderColor: "#e4e2df" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/seller/dashboard"
                            className="text-2xl sm:text-3xl font-light tracking-[0.32em] uppercase transition-opacity hover:opacity-80"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                        >
                            STITCHD<span style={{ color: "#C9A96E" }}>.</span>
                        </Link>
                        <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] px-2 py-1 border border-[#e4e2df] text-[#7A6E63]">
                            Seller Portal
                        </span>
                    </div>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/product/${product._id}`}
                            target="_blank"
                            className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] hover:text-[#1b1c1a] transition-colors flex items-center gap-1"
                        >
                            View Live Listing ↗
                        </Link>
                        <button
                            onClick={() => navigate('/seller/dashboard')}
                            className="py-2.5 px-5 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#d0c5b5] hover:border-[#1b1c1a] text-[#7A6E63] hover:text-[#1b1c1a] transition-all cursor-pointer"
                        >
                            ← Back to Vault
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT CONTAINER ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-10">

                {/* ── PRODUCT OVERVIEW HERO CARD ── */}
                <section
                    className="border p-6 sm:p-8 lg:p-10 shadow-xs"
                    style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}
                >
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">

                        {/* ── LEFT: COMPACT PRODUCT GALLERY WITH TOUCH/MOUSE SWIPE ── */}
                        <div className="w-full sm:w-60 md:w-64 lg:w-72 max-w-[280px] flex-shrink-0 space-y-2.5 mx-auto sm:mx-0">
                            <div
                                className="relative aspect-[3/4] border border-[#e4e2df] overflow-hidden bg-white shadow-xs select-none cursor-grab active:cursor-grabbing group"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            >
                                <img
                                    src={activeHeroImgUrl}
                                    alt={`${product.title} - angle ${safeHeroIndex + 1}`}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                    onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                    draggable="false"
                                />

                                {/* Top Floating Badges */}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                                    <span className="text-[8px] uppercase tracking-[0.2em] font-medium bg-[#1b1c1a]/85 text-[#fbf9f6] px-2 py-0.5 backdrop-blur-xs">
                                        Master Spec
                                    </span>
                                    {totalMasterImages > 1 && (
                                        <span className="text-[9px] font-mono font-medium bg-[#1b1c1a]/85 text-[#fbf9f6] px-2 py-0.5 backdrop-blur-xs">
                                            <span className="text-[#C9A96E]">{safeHeroIndex + 1}</span> / {totalMasterImages}
                                        </span>
                                    )}
                                </div>

                                {/* Previous Image Arrow */}
                                {totalMasterImages > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevMasterImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-[#1b1c1a]/80 hover:bg-[#C9A96E] text-[#fbf9f6] hover:text-[#1b1c1a] transition-all duration-200 cursor-pointer shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-xs"
                                        title="Previous angle (or swipe right)"
                                        aria-label="Previous angle"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                )}

                                {/* Next Image Arrow */}
                                {totalMasterImages > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleNextMasterImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-[#1b1c1a]/80 hover:bg-[#C9A96E] text-[#fbf9f6] hover:text-[#1b1c1a] transition-all duration-200 cursor-pointer shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-xs"
                                        title="Next angle (or swipe left)"
                                        aria-label="Next angle"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                )}

                                {/* Bottom Swipe Hint & Dot Indicators */}
                                {totalMasterImages > 1 && (
                                    <div className="absolute bottom-2.5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                                        <div className="flex items-center gap-1.5 pointer-events-auto">
                                            {masterImages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setHeroImageIndex(idx); }}
                                                    className={`transition-all duration-300 cursor-pointer ${safeHeroIndex === idx
                                                        ? "w-4 h-1 bg-[#C9A96E]"
                                                        : "w-1.5 h-1 bg-[#fbf9f6]/70 hover:bg-[#fbf9f6]"
                                                        }`}
                                                    aria-label={`Jump to angle ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Selector Strip */}
                            {totalMasterImages > 1 && (
                                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                                    {masterImages.map((img, idx) => (
                                        <button
                                            key={img._id || idx}
                                            type="button"
                                            onClick={() => setHeroImageIndex(idx)}
                                            className={`relative w-12 h-15 flex-shrink-0 border overflow-hidden transition-all duration-200 cursor-pointer bg-white ${safeHeroIndex === idx
                                                ? "border-[#C9A96E] ring-1 ring-[#C9A96E]/50 opacity-100"
                                                : "border-[#e4e2df] opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Angle thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover object-top"
                                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                            />
                                            <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono bg-[#1b1c1a]/80 text-[#fbf9f6] px-1">
                                                #{idx + 1}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: COMPLETE INITIAL PRODUCT SPECIFICATION & DETAILS ── */}
                        <div className="flex-1 space-y-6 min-w-0 w-full">
                            {/* Eyebrow Identification Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#e4e2df]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C9A96E] flex items-center gap-1.5">
                                        <span>✦</span> Master Archive Piece
                                    </span>
                                    <span className="text-[#d0c5b5]">·</span>
                                    <span className="font-mono text-[10px] text-[#7A6E63] bg-[#fbf9f6] px-2 py-0.5 border border-[#e4e2df]">
                                        ID: {product._id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyProductId}
                                        className="text-[9px] uppercase tracking-wider text-[#7A6E63] hover:text-[#1b1c1a] border border-[#e4e2df] hover:border-[#1b1c1a] px-2 py-0.5 transition-colors cursor-pointer"
                                        title="Copy Archive Spec ID"
                                    >
                                        {copiedId ? "✓ Copied" : "Copy ID"}
                                    </button>
                                </div>

                                <Link
                                    to={`/product/${product._id}`}
                                    target="_blank"
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] hover:text-[#1b1c1a] hover:underline underline-offset-4 transition-colors flex items-center gap-1"
                                >
                                    View Live Listing ↗
                                </Link>
                            </div>

                            {/* Title & Valuation */}
                            <div>
                                <h1
                                    className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-tight capitalize"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                                >
                                    {product.title}
                                </h1>
                                <div className="flex items-baseline gap-3 mt-2.5">
                                    <span className="text-2xl sm:text-3xl font-light text-[#1b1c1a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {formatPrice(product.price?.amount, product.price?.currency)}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E63]">
                                        Base Retail Valuation
                                    </span>
                                </div>
                            </div>

                            {/* Full Complete Description */}
                            <div className="space-y-1.5">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A6E63] font-semibold block">
                                    Piece Synopsis & Narrative
                                </span>
                                <div className="bg-[#fbf9f6] p-4 sm:p-5 border border-[#e4e2df]">
                                    <p className="text-xs sm:text-sm font-light text-[#3f3a34] leading-relaxed whitespace-pre-line">
                                        {product.description || "An essential silhouette balancing razor-sharp tailoring with fluid ease. Finished with reinforced seams and signature atelier touches."}
                                    </p>
                                </div>
                            </div>

                            {/* Archive Specifications Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A6E63] block">
                                        Archive Registered
                                    </span>
                                    <span className="text-xs font-medium text-[#1b1c1a] mt-1 block">
                                        {formatArchiveDate(product.createdAt)}
                                    </span>
                                </div>

                                <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A6E63] block">
                                        Master Angles
                                    </span>
                                    <span className="text-xs font-medium text-[#1b1c1a] mt-1 block">
                                        {totalMasterImages} {totalMasterImages === 1 ? 'Angle Photo' : 'Curated Angles'}
                                    </span>
                                </div>

                                <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A6E63] block">
                                        Vault Status
                                    </span>
                                    <span className={`text-xs font-medium mt-1 block ${totalStockCount > 0 ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>
                                        {totalStockCount > 0 ? `In Stock (${totalStockCount} Units)` : 'Awaiting Allocation'}
                                    </span>
                                </div>
                            </div>

                            {/* Real-time Inventory KPIs Bar */}
                            <div className="space-y-2 pt-2 border-t border-[#e4e2df]">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A6E63] font-semibold block">
                                    Inventory Performance Matrix
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#7A6E63]">
                                            Total Variants
                                        </span>
                                        <span className="text-2xl font-light mt-1 block text-[#1b1c1a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {totalVariantsCount}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#7A6E63]">
                                            Total Units
                                        </span>
                                        <span className="text-2xl font-light mt-1 block text-[#1b1c1a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {totalStockCount}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#7A6E63]">
                                            Low Stock (≤5)
                                        </span>
                                        <span className={`text-2xl font-light mt-1 block ${lowStockCount > 0 ? 'text-[#b45309]' : 'text-[#7A6E63]'}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {lowStockCount}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#fbf9f6] border border-[#e4e2df]">
                                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#7A6E63]">
                                            Out of Stock
                                        </span>
                                        <span className={`text-2xl font-light mt-1 block ${outOfStockCount > 0 ? 'text-[#dc2626]' : 'text-[#7A6E63]'}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {outOfStockCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── TWO-COLUMN SPLIT: CRAFT VARIANT (LEFT) & INVENTORY MATRIX (RIGHT) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* ── LEFT COLUMN: CREATE VARIANT FORM (5 Cols on LG) ── */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-5 space-y-6">
                        <div
                            className="p-6 sm:p-7 border"
                            style={{ backgroundColor: "#ffffff", borderColor: "#e4e2df" }}
                        >
                            <div className="border-b pb-4 mb-6 border-[#e4e2df]">
                                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C9A96E]">
                                    Vault Configuration
                                </span>
                                <h2
                                    className="text-2xl font-light mt-1"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                                >
                                    Craft New Variant
                                </h2>
                                <p className="text-xs text-[#7A6E63] mt-1 font-light">
                                    Configure dynamic attributes, valuation, and upload up to 7 photos from your device.
                                </p>
                            </div>

                            <form onSubmit={handleCreateVariant} className="space-y-6">

                                {/* 1. DYNAMIC ATTRIBUTES BUILDER */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a]">
                                            Dynamic Specifications
                                        </label>
                                        <span className="text-[9px] text-[#7A6E63] uppercase tracking-wider">
                                            Color, Size, Storage, Voltage
                                        </span>
                                    </div>

                                    {/* Quick Suggestion Pills */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className="text-[9px] uppercase tracking-wider text-[#7A6E63] self-center mr-1">
                                            Quick Add:
                                        </span>
                                        {ATTRIBUTE_SUGGESTIONS.map(sugg => (
                                            <button
                                                key={sugg}
                                                type="button"
                                                onClick={() => handleAddAttributeField(sugg)}
                                                className="text-[9px] uppercase tracking-wider px-2 py-1 bg-[#f5f3f0] hover:bg-[#C9A96E] hover:text-[#1b1c1a] border border-[#e4e2df] transition-colors cursor-pointer"
                                            >
                                                + {sugg}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Attributes List Inputs */}
                                    <div className="space-y-2.5">
                                        {attributesList.map((attr, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {/* Attribute Key (e.g. Color, Size, Storage, Voltage) */}
                                                <input
                                                    type="text"
                                                    placeholder="Attribute (e.g. Color)"
                                                    value={attr.key}
                                                    onChange={(e) => handleUpdateAttribute(idx, 'key', e.target.value)}
                                                    className="w-1/2 px-3 py-2 text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none transition-colors"
                                                    required
                                                />
                                                {/* Attribute Value (e.g. Black, 256GB, 220V) */}
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. Black)"
                                                    value={attr.value}
                                                    onChange={(e) => handleUpdateAttribute(idx, 'value', e.target.value)}
                                                    className="w-1/2 px-3 py-2 text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none transition-colors"
                                                    required
                                                />
                                                {/* Remove Row Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttribute(idx)}
                                                    className="p-2 text-[#7A6E63] hover:text-[#dc2626] transition-colors cursor-pointer"
                                                    title="Remove attribute"
                                                    aria-label="Remove attribute"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAddAttributeField('')}
                                        className="mt-3 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] hover:text-[#1b1c1a] transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <span className="text-base leading-none">+</span> Add Custom Specification
                                    </button>
                                </div>

                                {/* 2. PRICING & CURRENCY */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#e4e2df]">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a] mb-1.5">
                                            Variant Price
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 3200"
                                            value={variantPrice.amount}
                                            onChange={(e) => setVariantPrice(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full px-3 py-2 text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a] mb-1.5">
                                            Currency
                                        </label>
                                        <select
                                            value={variantPrice.currency}
                                            onChange={(e) => setVariantPrice(prev => ({ ...prev, currency: e.target.value }))}
                                            className="w-full px-3 py-2 text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none transition-colors cursor-pointer"
                                        >
                                            {CURRENCIES.map(curr => (
                                                <option key={curr} value={curr}>{curr}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ALLOCATION INFO NOTE */}
                                <div className="p-2.5 border border-[#e4e2df] bg-[#fbf9f6] text-[10px] text-[#7A6E63] flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-[#C9A96E]">✦</span>
                                        <span>Stock defaults to <strong>0</strong> · Imagery is <strong>optional</strong></span>
                                    </span>
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#7A6E63]">
                                        Default: 0 units
                                    </span>
                                </div>

                                {/* 3. INITIAL STOCK ALLOCATION */}
                                <div className="pt-2 border-t border-[#e4e2df]">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a]">
                                            Initial Vault Stock (Units)
                                        </label>
                                        <span className="text-[9px] uppercase tracking-wider text-[#7A6E63]">
                                            Optional (Default: 0)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setVariantStock(prev => Math.max(0, (parseInt(prev, 10) || 0) - 1))}
                                            className="w-9 h-9 border border-[#e4e2df] bg-[#fbf9f6] hover:bg-[#e4e2df] text-sm font-medium transition-colors cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={variantStock}
                                            onChange={(e) => setVariantStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                                            className="flex-1 px-3 py-2 text-center text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVariantStock(prev => (parseInt(prev, 10) || 0) + 1)}
                                            className="w-9 h-9 border border-[#e4e2df] bg-[#fbf9f6] hover:bg-[#e4e2df] text-sm font-medium transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* 4. VARIANT IMAGERY: UPLOAD FROM DEVICE (MAX 7 IMAGES) */}
                                <div className="pt-2 border-t border-[#e4e2df] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a]">
                                            Variant Imagery
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] uppercase tracking-wider text-[#7A6E63]">
                                                Optional
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 border border-[#e4e2df] bg-[#f5f3f0] text-[#7A6E63] tabular-nums">
                                                {variantImages.length} / {MAX_VARIANT_IMAGES} Photos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Uploaded Photos Grid */}
                                    {variantImages.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {variantImages.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative group aspect-[3/4] border border-[#e4e2df] overflow-hidden bg-white shadow-xs"
                                                    >
                                                        <img
                                                            src={img.preview}
                                                            alt={`Variant photo ${idx + 1}`}
                                                            className="w-full h-full object-cover object-top"
                                                        />
                                                        {/* Number pill */}
                                                        <span className="absolute top-1 left-1 text-[8px] bg-[#1b1c1a]/80 text-[#fbf9f6] px-1 py-0.5">
                                                            #{idx + 1}
                                                        </span>
                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[#1b1c1a]/85 hover:bg-[#dc2626] text-[#fbf9f6] text-[10px] opacity-90 transition-colors cursor-pointer"
                                                            title="Remove photo"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-[#7A6E63] pt-1">
                                                <span>JPG, PNG, WEBP · Max 5MB each</span>
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllImages}
                                                    className="text-[#dc2626] hover:underline cursor-pointer uppercase tracking-wider text-[9px]"
                                                >
                                                    Remove All
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Drag & Drop File Upload Box (if fewer than 7 images) */}
                                    {variantImages.length < MAX_VARIANT_IMAGES && (
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border border-dashed p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2"
                                            style={{
                                                borderColor: isDragging ? '#C9A96E' : '#d0c5b5',
                                                backgroundColor: isDragging ? 'rgba(201,169,110,0.06)' : '#fbf9f6'
                                            }}
                                        >
                                            <div className="w-8 h-8 border border-[#d0c5b5] flex items-center justify-center text-[#7A6E63]">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#1b1c1a]">
                                                    Drop up to {MAX_VARIANT_IMAGES - variantImages.length} photo(s) here or{' '}
                                                    <span className="text-[#C9A96E] font-medium underline underline-offset-2">
                                                        browse from device
                                                    </span>
                                                </p>
                                                <p className="text-[9px] uppercase tracking-wider text-[#7A6E63] mt-0.5">
                                                    Up to 7 images per variant
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden Multi-File Input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />

                                    {/* Optional: Assign master product photo if no new files uploaded */}
                                    {product.images && product.images.length > 0 && variantImages.length === 0 && (
                                        <div className="pt-2">
                                            <span className="text-[9px] uppercase tracking-wider text-[#7A6E63] block mb-2">
                                                Or assign from master product images:
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {product.images.map((img, idx) => (
                                                    <button
                                                        key={img._id || idx}
                                                        type="button"
                                                        onClick={() => handleSelectGalleryImage(idx)}
                                                        className={`w-12 h-14 border overflow-hidden transition-all duration-200 cursor-pointer ${selectedGalleryIndex === idx
                                                            ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/40"
                                                            : "border-[#e4e2df] opacity-60 hover:opacity-100"
                                                            }`}
                                                        title={`Use master image ${idx + 1}`}
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={`Product preview ${idx + 1}`}
                                                            className="w-full h-full object-cover object-top"
                                                            onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 5. SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-3.5 text-[11px] uppercase tracking-[0.25em] font-medium bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {actionLoading ? "Uploading & Allocating..." : "+ Save & Allocate Variant"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* ── RIGHT COLUMN: VARIANT INVENTORY & STOCK MATRIX (7 Cols) ── */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-6">
                        <div
                            className="p-6 sm:p-7 border"
                            style={{ backgroundColor: "#ffffff", borderColor: "#e4e2df" }}
                        >
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6 border-[#e4e2df]">
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C9A96E]">
                                        Inventory Matrix
                                    </span>
                                    <h2
                                        className="text-2xl font-light mt-1"
                                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                                    >
                                        Manage Variant Stock
                                    </h2>
                                </div>

                                {/* Search Bar */}
                                <div className="w-full sm:w-60">
                                    <input
                                        type="text"
                                        placeholder="Search by attribute / price..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {[
                                    { id: 'ALL', label: `All (${totalVariantsCount})` },
                                    { id: 'IN_STOCK', label: 'In Stock' },
                                    { id: 'LOW_STOCK', label: `Low Stock (${lowStockCount})` },
                                    { id: 'OUT_OF_STOCK', label: `Out of Stock (${outOfStockCount})` },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStatusFilter(tab.id)}
                                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-all cursor-pointer ${statusFilter === tab.id
                                            ? 'bg-[#1b1c1a] text-[#fbf9f6] font-medium'
                                            : 'bg-[#f5f3f0] text-[#7A6E63] hover:text-[#1b1c1a] border border-[#e4e2df]'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Variants List */}
                            {filteredVariants.length === 0 ? (
                                <div className="py-16 text-center border border-dashed border-[#e4e2df] p-6 bg-[#fbf9f6]">
                                    <span className="text-2xl text-[#C9A96E] block mb-2">✦</span>
                                    <p
                                        className="text-lg font-light text-[#1b1c1a]"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        {variantsList.length === 0
                                            ? "No Variants Configured Yet"
                                            : "No variants match the selected filter."}
                                    </p>
                                    <p className="text-xs text-[#7A6E63] mt-1">
                                        {variantsList.length === 0
                                            ? "Upload up to 7 photos from your device, configure specifications (color, size, storage, voltage), and manage vault units."
                                            : "Try clearing your search query or selecting 'All'."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredVariants.map((variant) => {
                                        const vStock = localStockMap[variant._id] ?? variant.stock ?? 0;
                                        const isOutOfStock = vStock === 0;
                                        const isLowStock = vStock > 0 && vStock <= 5;
                                        const hasUnsavedChanges = vStock !== (variant.stock ?? 0);
                                        const isSavingThis = updatingStockId === variant._id;

                                        // Variant images list (up to 7) - with master product fallback
                                        const rawImages = Array.isArray(variant.image)
                                            ? variant.image
                                            : variant.image ? [variant.image] : [];
                                        const hasCustomImages = rawImages.length > 0;
                                        const vImages = hasCustomImages
                                            ? rawImages.map(img => (typeof img === 'string' ? { url: img } : img))
                                            : (product.images && product.images.length > 0
                                                ? [product.images[0]]
                                                : [{ url: '/clothing_brand_login.jpg' }]);

                                        const primaryImgUrl = vImages[0]?.url || product.images?.[0]?.url || '/clothing_brand_login.jpg';

                                        // Attributes object/map to array
                                        const attrEntries = variant.attributes instanceof Map
                                            ? Array.from(variant.attributes.entries())
                                            : Object.entries(variant.attributes || {});

                                        return (
                                            <div
                                                key={variant._id}
                                                className={`border p-4 transition-all duration-200 ${hasUnsavedChanges
                                                    ? 'border-[#C9A96E] bg-[#fdfbf7]'
                                                    : 'border-[#e4e2df] bg-[#ffffff] hover:border-[#d0c5b5]'
                                                    }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                                    {/* Left: Thumbnail & Details */}
                                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                                        {/* Primary Thumbnail with multi-image indicator */}
                                                        <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border border-[#e4e2df] overflow-hidden bg-[#f5f3f0]">
                                                            <img
                                                                src={primaryImgUrl}
                                                                alt="Variant"
                                                                className="w-full h-full object-cover object-top"
                                                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                                            />
                                                            {vImages.length > 1 && (
                                                                <span className="absolute bottom-1 right-1 text-[8px] bg-[#1b1c1a]/85 text-[#fbf9f6] px-1 py-0.5 font-medium">
                                                                    {vImages.length} photos
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Specs, Pricing & Gallery Strip */}
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            {/* Attribute Chips */}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {attrEntries.map(([key, val]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="text-[10px] px-2 py-0.5 border border-[#e4e2df] bg-[#f5f3f0] text-[#1b1c1a] font-medium"
                                                                    >
                                                                        <span className="text-[#7A6E63] font-normal">{key}: </span>
                                                                        {val}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            {/* Valuation */}
                                                            <p className="text-xs font-semibold text-[#1b1c1a]">
                                                                {formatPrice(variant.price?.amount, variant.price?.currency)}
                                                            </p>

                                                            {/* Stock Status Badge */}
                                                            <div>
                                                                {isOutOfStock ? (
                                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#dc2626] bg-[#fee2e2] px-2 py-0.5 rounded-none border border-[#fca5a5]">
                                                                        ● Out of Stock
                                                                    </span>
                                                                ) : isLowStock ? (
                                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-none border border-[#fde68a]">
                                                                        ● Low Stock ({vStock} remaining)
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-none border border-[#86efac]">
                                                                        ● In Stock ({vStock} units)
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Additional Angle Thumbnails if more than 1 image */}
                                                            {vImages.length > 1 && (
                                                                <div className="flex gap-1 pt-1 overflow-x-auto">
                                                                    {vImages.map((img, i) => (
                                                                        <div
                                                                            key={img._id || i}
                                                                            className="w-7 h-9 border border-[#e4e2df] overflow-hidden flex-shrink-0 bg-white"
                                                                        >
                                                                            <img
                                                                                src={img.url}
                                                                                alt={`Angle ${i + 1}`}
                                                                                className="w-full h-full object-cover object-top"
                                                                                onError={(e) => { e.currentTarget.src = "/clothing_brand_login.jpg"; }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: Quick Stock Stepper & Actions */}
                                                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e4e2df]">

                                                        {/* Inline Stepper Controls */}
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStockChange(variant._id, vStock - 1)}
                                                                disabled={vStock <= 0}
                                                                className="w-7 h-7 flex items-center justify-center border border-[#e4e2df] bg-[#f5f3f0] hover:bg-[#e4e2df] text-xs font-medium disabled:opacity-30 cursor-pointer"
                                                                title="Decrease stock"
                                                            >
                                                                -
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={vStock}
                                                                onChange={(e) => handleStockChange(variant._id, e.target.value)}
                                                                className="w-14 h-7 text-center text-xs font-medium bg-[#fbf9f6] border border-[#e4e2df] focus:border-[#C9A96E] outline-none"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => handleStockChange(variant._id, vStock + 1)}
                                                                className="w-7 h-7 flex items-center justify-center border border-[#e4e2df] bg-[#f5f3f0] hover:bg-[#e4e2df] text-xs font-medium cursor-pointer"
                                                                title="Increase stock"
                                                            >
                                                                +
                                                            </button>

                                                            {/* Save Stock Button (Highlights when changes exist) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveVariantStock(variant._id)}
                                                                disabled={isSavingThis}
                                                                className={`px-2.5 h-7 text-[10px] uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer ${hasUnsavedChanges
                                                                    ? 'bg-[#C9A96E] text-[#1b1c1a] hover:bg-[#b89556] shadow-sm'
                                                                    : 'bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]'
                                                                    }`}
                                                            >
                                                                {isSavingThis ? "..." : hasUnsavedChanges ? "Save" : "Update"}
                                                            </button>
                                                        </div>

                                                        {/* Delete Variant Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteVariant(variant._id)}
                                                            className="text-[9px] uppercase tracking-[0.2em] text-[#7A6E63] hover:text-[#dc2626] transition-colors cursor-pointer"
                                                        >
                                                            Remove Variant
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </div>

                </div>

            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t mt-16" style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-[#7A6E63]">
                    <p>© 2026 STITCHD Atelier. Seller Inventory Management Engine.</p>
                    <Link to="/seller/dashboard" className="hover:text-[#1b1c1a] transition-colors">
                        Return to Seller Vault →
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default SellerProductDetails;
