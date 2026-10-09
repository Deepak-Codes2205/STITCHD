import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { useProduct } from "../hooks/useProduct";

// Fallback products used if backend has no products yet
const FALLBACK_PRODUCTS = [
    {
        _id: "6aabf40240144c4e08971fd9",
        title: "Tailored Wool Blend Blazer",
        description: "An essential silhouette balancing razor-sharp tailoring with fluid ease. Finished with reinforced seams and signature atelier touches.",
        price: { amount: "1000", currency: "INR" },
        images: [
            { url: "https://ik.imagekit.io/nr99q3eb6/snitch/download_6RcAerMFZ.jpg", _id: "1" },
            { url: "https://ik.imagekit.io/nr99q3eb6/snitch/korean_pant_oGfZXGm-D.jpg", _id: "2" }
        ]
    }
];

const Home = () => {
    const navigate = useNavigate();

    // 1. Redux & Hooks: Fetch and read products from global store
    const { handleGetAllProducts } = useProduct();
    const productsFromStore = useSelector((state) => state.product.products);
    const user = useSelector((state) => state.auth?.user);

    // 2. Simple local state for search input and sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("featured");

    // Fetch products once when page loads
    useEffect(() => {
        handleGetAllProducts();
    }, []);

    // If store has products, use them; otherwise use fallback
    const allProducts = useMemo(() => {
        if (productsFromStore && productsFromStore.length > 0) {
            return productsFromStore;
        }
        return FALLBACK_PRODUCTS;
    }, [productsFromStore]);

    // 3. Filter products by search query and sort them
    const filteredProducts = useMemo(() => {
        let items = [...allProducts];

        // Search filter (by title or description)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter((item) =>
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        // Sorting
        if (sortBy === "price-low") {
            items.sort((a, b) => Number(a.price?.amount || 0) - Number(b.price?.amount || 0));
        } else if (sortBy === "price-high") {
            items.sort((a, b) => Number(b.price?.amount || 0) - Number(a.price?.amount || 0));
        } else if (sortBy === "name") {
            items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        }

        return items;
    }, [allProducts, searchQuery, sortBy]);

    // Helper function to format price with Indian Rupee symbol
    const formatPrice = (priceObj) => {
        if (!priceObj) return "₹0";
        const amount = Number(priceObj.amount || 0).toLocaleString("en-IN");
        return priceObj.currency === "INR" ? `₹ ${amount}` : `${priceObj.currency} ${amount}`;
    };

    // 4. Navigate directly to ProductDetail page when clicking any product
    const handleProductClick = (product) => {
        navigate(`/product/${product._id}`);
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

            {/* ── 1. TOP ANNOUNCEMENT BAR ── */}
            <div
                className="w-full py-2.5 px-4 text-center border-b text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df", color: "#7A6E63" }}
            >
                Curated Archive // Complimentary Express Delivery & Bespoke Tailoring Consultation Across India
            </div>

            {/* ── 2. NAVIGATION BAR ── */}
            <header
                className="sticky top-0 z-40 w-full backdrop-blur-md border-b"
                style={{ backgroundColor: "rgba(251, 249, 246, 0.92)", borderColor: "#e4e2df" }}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
                    {/* Brand Logo & Navigation Links */}
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-2xl sm:text-3xl font-light tracking-[0.32em] uppercase transition-opacity hover:opacity-80"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                        >
                            STITCHD<span style={{ color: "#C9A96E" }}>.</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">
                            <a href="#catalog" className="transition-colors hover:text-[#1b1c1a]">
                                Collection
                            </a>
                            <a href="#atelier" className="transition-colors hover:text-[#1b1c1a]">
                                The Atelier
                            </a>
                            <a href="#craft" className="transition-colors hover:text-[#1b1c1a]">
                                Craftsmanship
                            </a>
                        </nav>
                    </div>

                    {/* Right Side: Seller Studio & Auth Status */}
                    <div className="flex items-center gap-5 sm:gap-7">
                        {user && user.role === "seller" && (
                            <Link
                                to="/seller/dashboard"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium py-1.5 px-3 border transition-colors duration-200"
                                style={{ borderColor: "#C9A96E", color: "#1b1c1a" }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A96E" }}></span>
                                Seller Studio
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[11px] font-medium text-[#1b1c1a] capitalize leading-none">
                                        {user.fullname || user.email?.split("@")[0]}
                                    </p>
                                    <p className="text-[9px] uppercase tracking-[0.15em] text-[#7A6E63] mt-0.5">
                                        {user.role}
                                    </p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif uppercase"
                                    style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
                                >
                                    {(user.fullname || user.email || "U")[0]}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.18em]">
                                <Link to="/login" className="transition-colors text-[#7A6E63] hover:text-[#1b1c1a]">
                                    Sign In
                                </Link>
                                <span className="text-[#d0c5b5]">/</span>
                                <Link to="/register" className="transition-colors" style={{ color: "#C9A96E" }}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── 3. EDITORIAL HERO SECTION ── */}
            <section className="relative overflow-hidden border-b" style={{ borderColor: "#e4e2df" }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="max-w-3xl">
                        {/* Gold Subtitle Tag */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-px" style={{ backgroundColor: "#C9A96E" }}></span>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold" style={{ color: "#C9A96E" }}>
                                STITCHD ATELIER // ARCHIVE VOL. I
                            </p>
                        </div>

                        {/* Big Headline */}
                        <h1
                            className="text-4xl sm:text-6xl lg:text-7xl font-light leading-[1.08] tracking-tight mb-8"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                        >
                            Architectural silhouettes.<br />
                            <span className="italic" style={{ color: "#7A6E63" }}>Engineered in precision.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base font-light leading-relaxed max-w-xl text-[#7A6E63] mb-10">
                            Meticulous drape, hand-selected fabrics, and limited atelier releases.
                            Each garment is an exploration of restraint and proportion, designed for seamless longevity.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-5">
                            <a
                                href="#catalog"
                                className="py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]"
                            >
                                Explore Creations
                            </a>

                            {user?.role === "seller" ? (
                                <Link
                                    to="/seller/create-product"
                                    className="py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium border border-[#d0c5b5] hover:border-[#C9A96E] transition-all duration-300 text-[#1b1c1a]"
                                >
                                    + Publish Piece
                                </Link>
                            ) : (
                                <a
                                    href="#craft"
                                    className="py-4 px-6 text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] hover:text-[#1b1c1a] transition-colors"
                                >
                                    Our Philosophy →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. CATALOG SEARCH & SORT CONTROLS ── */}
            <section id="catalog" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b" style={{ borderColor: "#e4e2df" }}>
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: "#C9A96E" }}>
                            Curated Catalog
                        </span>
                        <h2
                            className="text-3xl sm:text-4xl font-light mt-1.5"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                        >
                            The Current Collection
                        </h2>
                    </div>

                    {/* Search and Sort Toolbar */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        {/* Search Input */}
                        <div className="relative min-w-[220px] sm:min-w-[260px]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search archive..."
                                className="w-full bg-transparent py-2.5 pl-0 pr-8 text-xs border-b border-[#d0c5b5] focus:border-[#C9A96E] transition-colors duration-300 outline-none text-[#1b1c1a]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-1 top-2.5 text-xs text-[#7A6E63] hover:text-[#1b1c1a]"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A6E63]">
                                Sort:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent py-2 text-xs uppercase tracking-[0.12em] font-medium cursor-pointer outline-none border-b border-[#d0c5b5] text-[#1b1c1a]"
                            >
                                <option value="featured">Curated Drops</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Title (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Counter Bar */}
                <div className="py-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#7A6E63]">
                    <span>
                        Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Creation" : "Creations"}
                    </span>
                    {searchQuery && (
                        <span>
                            Filtering by: &quot;{searchQuery}&quot;
                        </span>
                    )}
                </div>
            </section>

            {/* ── 5. PRODUCTS GRID ── */}
            <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-28">
                {filteredProducts.length === 0 ? (
                    <div className="py-24 text-center border" style={{ borderColor: "#e4e2df", backgroundColor: "#f5f3f0" }}>
                        <p className="text-2xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            No creations match your criteria
                        </p>
                        <p className="text-xs text-[#7A6E63] mb-6">
                            Try clearing search filters or checking back as new releases drop.
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="py-3 px-6 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#1b1c1a] text-[#1b1c1a]"
                        >
                            Reset Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
                        {filteredProducts.map((product) => {
                            const images = product.images || [];
                            const mainImg = images[0]?.url || "/clothing_brand_login.jpg";
                            const hoverImg = images[1]?.url || mainImg;

                            return (
                                <article
                                    key={product._id}
                                    onClick={() => handleProductClick(product)}
                                    className="group flex flex-col justify-between transition-all duration-300 cursor-pointer"
                                >
                                    {/* Card Image Area */}
                                    <div
                                        className="relative aspect-[3/4] w-full overflow-hidden"
                                        style={{ backgroundColor: "#f2efe9" }}
                                    >
                                        {/* Primary Image */}
                                        <img
                                            src={mainImg}
                                            alt={product.title || "Garment silhouette"}
                                            className={`w-full h-full object-cover object-top transition-all duration-700 ${
                                                images.length > 1 ? "group-hover:opacity-0" : "group-hover:scale-105"
                                            }`}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = "/clothing_brand_login.jpg";
                                            }}
                                        />

                                        {/* Hover Image (if 2+ images exist) */}
                                        {images.length > 1 && (
                                            <img
                                                src={hoverImg}
                                                alt={`${product.title || "Product"} alternate view`}
                                                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src = mainImg;
                                                }}
                                            />
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-1 bg-[#1b1c1a]/80 text-[#fbf9f6] backdrop-blur-sm">
                                                Atelier Cut
                                            </span>
                                        </div>

                                        {/* Hover Action Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#1b1c1a]/85 via-[#1b1c1a]/50 to-transparent flex items-center justify-center z-20">
                                            <span className="w-full text-center py-2 text-[10px] uppercase tracking-[0.2em] text-[#fbf9f6] border border-white/40 hover:border-white transition-colors">
                                                View Piece Details
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Metadata */}
                                    <div className="pt-5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="flex items-baseline justify-between gap-2 mb-1.5">
                                                <h3
                                                    className="text-lg font-normal tracking-wide capitalize transition-colors group-hover:text-[#C9A96E]"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                                >
                                                    {product.title}
                                                </h3>
                                                <span className="text-sm font-medium text-[#1b1c1a] whitespace-nowrap">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#7A6E63] font-light line-clamp-2 leading-relaxed mb-4">
                                                {product.description || "Refined tailored silhouette crafted with precision stitching and fluid drape."}
                                            </p>
                                        </div>

                                        {/* Bottom Action Line */}
                                        <div
                                            className="pt-3 border-t flex items-center justify-between text-[10px] uppercase tracking-[0.18em]"
                                            style={{ borderColor: "#e4e2df" }}
                                        >
                                            <span style={{ color: "#7A6E63" }}>
                                                {images.length || 1} {images.length === 1 ? "Angle" : "Angles"}
                                            </span>
                                            <span
                                                className="font-medium text-[#1b1c1a] group-hover:text-[#C9A96E] transition-colors"
                                            >
                                                Inspect Piece →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── 6. ATELIER PHILOSOPHY & CRAFT SECTION ── */}
            <section id="craft" className="border-t border-b" style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-5">
                            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: "#C9A96E" }}>
                                Atelier Standards
                            </span>
                            <h2
                                className="text-3xl sm:text-5xl font-light leading-tight mt-2 mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                            >
                                Tailoring without compromise.
                            </h2>
                            <p className="text-sm font-light text-[#7A6E63] leading-relaxed mb-8">
                                Every STITCHD silhouette begins with architectural drafting and disciplined pattern-making.
                                We reject trend-driven excess, focusing solely on balanced proportions, tactile longevity,
                                and effortless poise.
                            </p>
                            <div className="space-y-4 border-t pt-6" style={{ borderColor: "#e4e2df" }}>
                                <div className="flex items-start gap-4">
                                    <span className="text-xs font-serif text-[#C9A96E]">01</span>
                                    <div>
                                        <h4 className="text-xs uppercase tracking-[0.15em] font-medium text-[#1b1c1a]">Natural Fibers & Drape</h4>
                                        <p className="text-xs text-[#7A6E63] mt-0.5">Heavyweight linens, combed cotton twills, and refined structured blends.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-xs font-serif text-[#C9A96E]">02</span>
                                    <div>
                                        <h4 className="text-xs uppercase tracking-[0.15em] font-medium text-[#1b1c1a]">Artisanal Hand Finishing</h4>
                                        <p className="text-xs text-[#7A6E63] mt-0.5">Bound seams, horn buttons, and calibrated hems tailored to perfection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: "#eae7e2" }}>
                                <img
                                    src="/clothing_brand_login.jpg"
                                    alt="Editorial Atelier Studio"
                                    className="w-full h-full object-cover object-center filter brightness-95"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{ background: "linear-gradient(to top, rgba(27,24,20,0.65) 0%, transparent 60%)" }}
                                />
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                                    <span className="text-xl sm:text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        Private Salon & Fitting Studio
                                    </span>
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A96E]">
                                        Curated 2026
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. FOOTER ── */}
            <footer className="border-t" style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                        {/* Column 1: Brand */}
                        <div className="md:col-span-4">
                            <span
                                className="text-2xl font-light tracking-[0.35em] uppercase block mb-4"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
                            >
                                STITCHD<span style={{ color: "#C9A96E" }}>.</span>
                            </span>
                            <p className="text-xs text-[#7A6E63] font-light leading-relaxed max-w-sm mb-6">
                                Quiet exclusivity and architectural tailoring. Designed for collectors who appreciate
                                unfussy precision and pure materiality.
                            </p>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "#C9A96E" }}>
                                Paris • Milan • New Delhi
                            </span>
                        </div>

                        {/* Column 2: Navigation Links */}
                        <div className="md:col-span-2">
                            <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1b1c1a] mb-4">
                                Archive
                            </h5>
                            <ul className="space-y-2.5 text-xs text-[#7A6E63]">
                                <li><a href="#catalog" className="hover:text-[#1b1c1a] transition-colors">Vol. I Current</a></li>
                                <li><a href="#catalog" className="hover:text-[#1b1c1a] transition-colors">Tailored Trousers</a></li>
                                <li><a href="#catalog" className="hover:text-[#1b1c1a] transition-colors">Bespoke Coats</a></li>
                                <li><a href="#catalog" className="hover:text-[#1b1c1a] transition-colors">Made-to-Measure</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Atelier Information */}
                        <div className="md:col-span-2">
                            <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1b1c1a] mb-4">
                                Client Services
                            </h5>
                            <ul className="space-y-2.5 text-xs text-[#7A6E63]">
                                <li><a href="#craft" className="hover:text-[#1b1c1a] transition-colors">Salon Appointments</a></li>
                                <li><a href="#craft" className="hover:text-[#1b1c1a] transition-colors">Garment Care</a></li>
                                <li><a href="#catalog" className="hover:text-[#1b1c1a] transition-colors">Insured Shipping</a></li>
                                <li>
                                    {user ? (
                                        user.role === "seller" ? (
                                            <Link to="/seller/dashboard" className="text-[#C9A96E] hover:underline">Seller Studio</Link>
                                        ) : (
                                            <span>Account Active</span>
                                        )
                                    ) : (
                                        <Link to="/login" className="hover:text-[#1b1c1a] transition-colors">Sign In / Register</Link>
                                    )}
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Newsletter */}
                        <div className="md:col-span-4">
                            <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1b1c1a] mb-4">
                                Private Dispatches
                            </h5>
                            <p className="text-xs text-[#7A6E63] font-light leading-relaxed mb-4">
                                Receive confidential notices of private archive drops and bespoke appointments.
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert("You have been added to our private dispatch registry.");
                                }}
                                className="flex flex-col gap-3"
                            >
                                <input
                                    type="email"
                                    placeholder="client@atelier.com"
                                    required
                                    className="w-full bg-transparent outline-none py-2.5 text-xs border-b border-[#d0c5b5] focus:border-[#C9A96E] text-[#1b1c1a]"
                                />
                                <button
                                    type="submit"
                                    className="py-3 px-5 text-[10px] uppercase tracking-[0.25em] font-medium transition-colors bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom copyright line */}
                    <div
                        className="pt-12 mt-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-[#7A6E63]"
                        style={{ borderColor: "#e4e2df" }}
                    >
                        <p>© 2026 STITCHD Atelier. All Rights Reserved.</p>
                        <p className="flex items-center gap-6">
                            <span className="hover:text-[#1b1c1a] cursor-pointer">Privacy Protocol</span>
                            <span className="hover:text-[#1b1c1a] cursor-pointer">Terms of Commission</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;