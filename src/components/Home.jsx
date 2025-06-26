import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { formatPrice } from "../utils/formatPrice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";
import ChatBot from "./ChatBot";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

const CATEGORIES = ["Mobile", "Laptop", "Headphone", "Electronics", "Toys", "Fashion"];

const Home = ({ selectedCategory }) => {
    const { data, isError, addToCart, refreshData } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [category, setCategory] = useState(selectedCategory || "");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isInitialized) {
            refreshData();
            setIsInitialized(true);
        }
    }, [isInitialized, refreshData]);

    useEffect(() => {
        const fetchImages = async () => {
            const latestIds = [...data]
                .sort((a, b) => b.id - a.id)
                .slice(0, 5)
                .map((p) => p.id);

            const updated = await Promise.all(
                data.map(async (product) => {
                    try {
                        const res = await axios.get(
                            `http://localhost:8080/api/product/${product.id}/image`,
                            { responseType: "blob" }
                        );
                        const imageUrl = URL.createObjectURL(res.data);
                        return {
                            ...product,
                            imageUrl,
                            isNew: latestIds.includes(product.id),
                        };
                    } catch {
                        return {
                            ...product,
                            imageUrl: unplugged,
                            isNew: latestIds.includes(product.id),
                        };
                    }
                })
            );
            setProducts(updated);
        };

        if (data?.length) fetchImages();
    }, [data]);

    const filtered = category
        ? products.filter(
            (p) => p.category?.toLowerCase() === category.toLowerCase()
        )
        : products;

    const latest = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

    if (isError)
        return (
            <div className="error-container">
                <img src={unplugged} alt="Error" className="error-image" />
            </div>
        );

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={2000} />
            <div className="home-background">
                {/* Banner */}
                <div className="hero-swiper">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        style={{ backgroundColor: "#000" }}
                    >
                        {latest.map((prod) => (
                            <SwiperSlide key={prod.id}>
                                <section
                                    className="hero-banner"
                                    style={{ backgroundImage: `url(${prod.imageUrl})` }}
                                >
                                    <div className="hero-overlay" />
                                    <div className="hero-content">
                                        <h1 className="hero-title">{prod.name}</h1>
                                        <p className="hero-subtitle">~ {prod.brand}</p>
                                        <button
                                            className="hero-btn"
                                            onClick={() => navigate(`/product/${prod.id}`)}
                                        >
                                            Shop Now – {formatPrice(prod.price)}
                                        </button>
                                    </div>
                                </section>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Category Buttons */}
                <div className="category-buttons-container">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`category-button ${
                                category.toLowerCase() === cat.toLowerCase() ? "active" : ""
                            }`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                    <button
                        className={`category-button ${!category ? "active" : ""}`}
                        onClick={() => setCategory("")}
                    >
                        All
                    </button>
                </div>

                {/* Product Grid */}
                <div className="home-container">
                    {filtered.length === 0 ? (
                        <h2 className="no-products">No Products Available</h2>
                    ) : (
                        filtered.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`} className="product-link">
                                    {product.isNew && <span className="badge">New</span>}
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                    <div className="product-info">
                                        <div className="product-title">{product.name}</div>
                                        <div className="product-brand">~ {product.brand}</div>
                                        <div className="product-price">
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                </Link>
                                <div className="product-actions">
                                    <button
                                        className={`btn add ${
                                            !product.productAvailable ? "disabled" : ""
                                        }`}
                                        disabled={!product.productAvailable}
                                        onClick={() => {
                                            addToCart({ ...product, quantity: 1 });
                                            toast.success(`${product.name} added to cart`);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className={`btn buy ${
                                            !product.productAvailable ? "disabled" : ""
                                        }`}
                                        disabled={!product.productAvailable}
                                        onClick={() => {
                                            addToCart({ ...product, quantity: 1 });
                                            navigate("/cart");
                                        }}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="footer">
                    &copy; 2025 <span className="footer-brand">Walmart</span> Clone. All rights reserved.
                </footer>
            </div>
            <ChatBot />
        </>
    );
};

export default Home;
