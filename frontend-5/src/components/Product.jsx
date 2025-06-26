// unchanged imports
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import axios from "axios";
import { Button, Modal, Table } from "react-bootstrap";

const Product = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, removeFromCart, refreshData, data } = useContext(AppContext);

    const [product, setProduct] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [compareItems, setCompareItems] = useState([]);
    const [showCompare, setShowCompare] = useState(false);
    const [sameCategoryProducts, setSameCategoryProducts] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/product/${id}`);
                setProduct(res.data);

                if (res.data.imageName) {
                    const imgRes = await axios.get(
                        `http://localhost:8080/api/product/${id}/image`,
                        { responseType: "blob" }
                    );
                    setImageUrl(URL.createObjectURL(imgRes.data));
                }
            } catch (err) {
                console.error("Error loading product:", err);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!product || !data?.length) return;

            const filtered = data.filter(
                (p) => p.id !== product.id && p.category === product.category
            );

            const updated = await Promise.all(
                filtered.map(async (p) => {
                    try {
                        const res = await axios.get(
                            `http://localhost:8080/api/product/${p.id}/image`,
                            { responseType: "blob" }
                        );
                        const image = URL.createObjectURL(res.data);
                        return { ...p, imageUrl: image };
                    } catch {
                        return { ...p, imageUrl: "" };
                    }
                })
            );
            setSameCategoryProducts(updated);
        };

        fetchImages();
    }, [product, data]);

    const handleAddToCart = () => {
        const updated = { ...product, quantity: 1 };
        addToCart(updated);
        alert(`${product.name} added to cart`);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/product/${id}`);
            removeFromCart(id);
            refreshData();
            alert("Product deleted");
            navigate("/");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleSmartCompare = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/product/${id}/compare`);
            setCompareItems(res.data || []);
            setShowCompare(true);
        } catch (err) {
            console.error("Compare error:", err);
            setCompareItems([]);
            setShowCompare(true);
        }
    };

    const handleUpdate = () => {
        navigate(`/product/update/${id}`);
    };

    if (!product) {
        return <h2 style={{ textAlign: "center", padding: "6rem" }}>Loading...</h2>;
    }

    return (
        <div style={{ padding: "1rem", backgroundColor: "#f8f9fa", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                <div style={{ flex: 1, minWidth: "260px", textAlign: "center" }}>
                    <img
                        src={imageUrl}
                        alt={product.name}
                        style={{
                            width: "100%",
                            maxWidth: "300px",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                        }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: "260px" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{product.name}</h2>
                    <p style={{ color: "#666" }}><i>Brand: {product.brand}</i></p>
                    <p>{product.description}</p>
                    <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0071dc" }}>
                        ₹ {product.price}
                    </p>
                    <p><span className={`badge ${product.productAvailable ? 'bg-success' : 'bg-danger'}`}>{product.productAvailable ? 'In Stock' : 'Out of Stock'}</span></p>
                    <p>Category: {product.category}</p>

                    <div style={{
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                        margin: "1rem 0",
                        borderRadius: "6px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                    }}>
                        <h5>🚚 Expected Delivery</h5>
                        <p style={{ color: "green" }}>✔ Same Day Delivery with <span style={{ color: "#0071dc" }}>PLUS Membership</span></p>
                        <p>📦 Standard delivery within <b>7 days</b></p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.productAvailable}
                            style={{
                                padding: "10px",
                                backgroundColor: product.productAvailable ? "#0071dc" : "#ccc",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                fontSize: "1rem"
                            }}
                        >
                            🛒 <b>Add to Cart</b>
                        </button>

                        <button
                            onClick={() => {
                                addToCart({ ...product, quantity: 1 });
                                setShowCheckout(true);
                            }}
                            disabled={!product.productAvailable}
                            style={{
                                padding: "10px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                fontSize: "1rem"
                            }}
                        >
                            💰 <b>Buy Now</b>
                        </button>

                        <button
                            onClick={handleSmartCompare}
                            style={{
                                padding: "10px",
                                backgroundColor: "#ffc220",
                                color: "#000",
                                border: "none",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                fontSize: "1rem"
                            }}
                        >
                            💡 <b>SMARTY COMPARE</b>
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                        <button
                            onClick={handleUpdate}
                            style={{
                                flex: 1,
                                padding: "8px",
                                backgroundColor: "#17a2b8",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px"
                            }}
                        >
                            Update
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                flex: 1,
                                padding: "8px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px"
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            {/* Price Trend Analysis */}
            {product && (
                <div style={{ marginTop: "2rem" }}>
                    <h4>📊 Price Trend (Past 7 Days)</h4>
                    <div style={{
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        padding: "1rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
                    }}>
                        <Table bordered hover size="sm">
                            <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Price (₹)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                                { date: "2025-06-24", price: product.price },
                                { date: "2025-06-23", price: product.price + 300 },
                                { date: "2025-06-22", price: product.price + 100 },
                                { date: "2025-06-21", price: product.price - 200 },
                                { date: "2025-06-20", price: product.price - 150 },
                                { date: "2025-06-19", price: product.price + 50 },
                                { date: "2025-06-18", price: product.price - 100 }
                            ].map((p, idx) => (
                                <tr key={idx}>
                                    <td>{p.date}</td>
                                    <td>₹{p.price}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        <p style={{ color: "#28a745", marginTop: "0.5rem", fontWeight: "bold" }}>
                            {(() => {
                                const prices = [product.price, product.price + 300, product.price + 100, product.price - 200, product.price - 150, product.price + 50, product.price - 100];
                                const curr = product.price;
                                const min = Math.min(...prices);
                                const max = Math.max(...prices);
                                if (curr === min) return "📉 Lowest price in 7 days!";
                                if (curr === max) return "📈 Highest price in 7 days.";
                                return "↕ Fluctuating trend observed.";
                            })()}
                        </p>
                    </div>
                </div>
            )}


            {/* Reviews */}
            <div style={{ marginTop: "2rem" }}>
                <h4>User Reviews</h4>
                <div style={{ backgroundColor: "#fff", padding: "1rem", borderRadius: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <p><strong>User 1:</strong> ⭐⭐⭐⭐⭐ — Great product! Easy to use and totally worth the price.</p>
                    <p><strong>User 2:</strong> ⭐⭐⭐⭐ — Very satisfied with the quality and support.</p>
                    <p><strong>User 3:</strong> ⭐⭐ — Not as expected. Delivery was delayed and quality was average.</p>
                </div>
            </div>

            {/* Related products */}
            {sameCategoryProducts.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h4>More in "{product.category}"</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                        {sameCategoryProducts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/product/${p.id}`)}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor: "#fff",
                                    borderRadius: "6px",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                                    padding: "0.5rem"
                                }}
                            >
                                <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    style={{ width: "100%", height: "130px", objectFit: "cover" }}
                                />
                                <div style={{ marginTop: "0.5rem" }}>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ color: "#0071dc", fontWeight: "bold" }}>₹ {p.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Compare Modal */}
            <Modal size="lg" show={showCompare} onHide={() => setShowCompare(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Smarty ⚡ Compare</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {compareItems.length === 0 ? (
                        <p className="text-danger text-center">No similar products found.</p>
                    ) : (
                        <div className="table-responsive">
                            <Table bordered hover className="text-center align-middle" size="sm">
                                <thead className="table-light">
                                <tr>
                                    <th>Feature</th>
                                    <th>Selected</th>
                                    {compareItems.map((p) => <th key={p.id}>{p.name}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Brand</td>
                                    <td>{product.brand}</td>
                                    {compareItems.map((p) => <td key={`brand-${p.id}`}>{p.brand}</td>)}
                                </tr>
                                <tr>
                                    <td>Description</td>
                                    <td>{product.description}</td>
                                    {compareItems.map((p) => (
                                        <td key={`desc-${p.id}`}>
                                            {p.description.length > 60 ? p.description.slice(0, 60) + "..." : p.description}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td>Price</td>
                                    <td>₹{product.price}</td>
                                    {compareItems.map((p) => <td key={`price-${p.id}`}>₹{p.price}</td>)}
                                </tr>
                                <tr>
                                    <td>Stock</td>
                                    <td>{product.stockQuantity}</td>
                                    {compareItems.map((p) => <td key={`stock-${p.id}`}>{p.stockQuantity}</td>)}
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCompare(false)} size="sm">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Checkout Modal */}
            <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Purchase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Proceed to checkout with <strong>{product.name}</strong> for ₹{product.price}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCheckout(false)} size="sm">
                        Cancel
                    </Button>
                    <Button variant="success" onClick={() => {
                        setShowCheckout(false);
                        navigate("/cart");
                    }} size="sm">
                        Go to Checkout
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Product;