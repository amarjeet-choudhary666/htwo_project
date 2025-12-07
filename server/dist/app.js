"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const partnerRoutes_1 = __importDefault(require("./routes/partnerRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/admin/adminRoutes"));
const adminPartnerControllerRoutes_1 = __importDefault(require("./routes/admin/adminPartnerControllerRoutes"));
const formSubmissionRoutes_1 = __importDefault(require("./routes/formSubmissionRoutes"));
const purchaseRoutes_1 = __importDefault(require("./routes/purchaseRoutes"));
const serviceRequestRoutes_1 = __importDefault(require("./routes/serviceRequestRoutes"));
const partnerServiceRequestRoutes_1 = __importDefault(require("./routes/partnerServiceRequestRoutes"));
const partnerUserRoutes_1 = __importDefault(require("./routes/partnerUserRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later.',
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many authentication attempts, please try again later.',
});
app.use('/api', limiter);
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/admin/login', authLimiter);
app.use('/admin', express_1.default.static(path_1.default.join(__dirname, '../../admin_panel/dist')));
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:5175"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/v1/users", authRoutes_1.default);
app.use("/api/v1/users", profileRoutes_1.default);
app.use("/api/v1", serviceRoutes_1.default);
app.use("/api/v1", partnerRoutes_1.default);
app.use("/api/v1", userRoutes_1.default);
app.use("/api/v1/admin", adminRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/v1/admin/partners", adminPartnerControllerRoutes_1.default);
app.use("/api/v1/forms", formSubmissionRoutes_1.default);
app.use("/api/v1/purchases", purchaseRoutes_1.default);
app.use("/api/v1/service-requests", serviceRequestRoutes_1.default);
app.use("/api/v1/partner/service-requests", partnerServiceRequestRoutes_1.default);
app.use("/api/v1/partner/users", partnerUserRoutes_1.default);
app.use("/api/v1/test", testRoutes_1.default);
app.post("/api/v1/send-email", async (req, res) => {
    try {
        const { name, email, phone, service, question } = req.body;
        console.log("Email data received:", { name, email, phone, service, question });
        res.status(200).json({ message: "Email sent successfully" });
    }
    catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});
app.get("/", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Something went wrong';
    res.status(status).json({ error: { message, status } });
});
app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});
