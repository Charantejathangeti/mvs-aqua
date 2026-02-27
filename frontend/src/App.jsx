import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminProductEdit from "./pages/admin/AdminProductEdit.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public-facing site */}
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* Admin login (no layout wrapper) */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Admin area */}
      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductEdit />} />
        <Route path="/admin/products/:id" element={<AdminProductEdit />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
