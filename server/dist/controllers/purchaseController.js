"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadInvoice = exports.getUserPurchases = exports.createPurchase = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.createPurchase = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { serviceId, serviceType, amount, paymentMethod, billingCycle } = req.body;
    if (!userId) {
        throw new apiError_1.ApiError(401, 'User not authenticated');
    }
    if (!serviceId || !serviceType || !amount) {
        throw new apiError_1.ApiError(400, 'Service ID, service type, and amount are required');
    }
    let dbServiceType;
    if (serviceType === 'VPS' || serviceType === 'DEDICATED') {
        dbServiceType = 'SERVER';
    }
    else if (serviceType === 'CLOUD') {
        dbServiceType = 'CLOUD';
    }
    else {
        dbServiceType = 'CLOUD';
    }
    const expiresAt = new Date();
    console.log('Billing cycle received:', billingCycle);
    if (billingCycle === 'yearly') {
        expiresAt.setDate(expiresAt.getDate() + 365);
        console.log('Setting yearly expiration:', expiresAt);
    }
    else {
        expiresAt.setDate(expiresAt.getDate() + 31);
        console.log('Setting monthly expiration:', expiresAt);
    }
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId,
            serviceId: serviceId.toString(),
            serviceType: dbServiceType,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod || 'dummy',
            paymentStatus: 'COMPLETED',
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            expiresAt,
            planType: billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    companyName: true,
                    address: true,
                    gstNumber: true,
                }
            }
        }
    });
    const invoicePath = await generateInvoice(purchase);
    const updatedPurchase = await prisma_1.prisma.purchase.update({
        where: { id: purchase.id },
        data: { invoicePdf: invoicePath }
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, updatedPurchase, 'Purchase completed successfully'));
});
exports.getUserPurchases = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new apiError_1.ApiError(401, 'User not authenticated');
    }
    const purchases = await prisma_1.prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    email: true,
                    firstname: true,
                }
            }
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, purchases, 'Purchases retrieved successfully'));
});
exports.downloadInvoice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { purchaseId } = req.params;
    if (!userId) {
        throw new apiError_1.ApiError(401, 'User not authenticated');
    }
    const purchase = await prisma_1.prisma.purchase.findFirst({
        where: {
            id: parseInt(purchaseId),
            userId
        }
    });
    if (!purchase) {
        throw new apiError_1.ApiError(404, 'Purchase not found');
    }
    if (!purchase.invoicePdf) {
        throw new apiError_1.ApiError(404, 'Invoice not found');
    }
    const invoicePath = path_1.default.join(process.cwd(), purchase.invoicePdf);
    if (!fs_1.default.existsSync(invoicePath)) {
        throw new apiError_1.ApiError(404, 'Invoice file not found');
    }
    res.download(invoicePath, `invoice-${purchase.id}.pdf`);
});
async function generateInvoice(purchase) {
    const invoicesDir = path_1.default.join(process.cwd(), 'invoices');
    if (!fs_1.default.existsSync(invoicesDir)) {
        fs_1.default.mkdirSync(invoicesDir, { recursive: true });
    }
    const fileName = `invoice-${purchase.id}-${Date.now()}.pdf`;
    const filePath = path_1.default.join(invoicesDir, fileName);
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50 });
        const stream = fs_1.default.createWriteStream(filePath);
        doc.pipe(stream);
        doc
            .fontSize(20)
            .text('H2 Technologies', 50, 50)
            .fontSize(10)
            .text('Cloud Services Provider', 50, 75)
            .text('Email: info@h2technologies.com', 50, 90)
            .text('Phone: +91 1234567890', 50, 105);
        doc
            .fontSize(20)
            .text('INVOICE', 400, 50);
        doc
            .fontSize(10)
            .text(`Invoice #: INV-${purchase.id}`, 400, 75)
            .text(`Date: ${new Date(purchase.createdAt).toLocaleDateString()}`, 400, 90)
            .text(`Transaction ID: ${purchase.transactionId}`, 400, 105);
        doc
            .moveTo(50, 130)
            .lineTo(550, 130)
            .stroke();
        doc
            .fontSize(12)
            .text('Bill To:', 50, 150)
            .fontSize(10)
            .text(purchase.user.firstname || 'Customer', 50, 170)
            .text(purchase.user.email, 50, 185);
        if (purchase.user.companyName) {
            doc.text(purchase.user.companyName, 50, 200);
        }
        if (purchase.user.address) {
            doc.text(purchase.user.address, 50, 215);
        }
        if (purchase.user.gstNumber) {
            doc.text(`GST: ${purchase.user.gstNumber}`, 50, 230);
        }
        const tableTop = 280;
        doc
            .fontSize(10)
            .text('Description', 50, tableTop)
            .text('Service Type', 250, tableTop)
            .text('Amount', 450, tableTop, { width: 90, align: 'right' });
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();
        const rowTop = tableTop + 25;
        doc
            .fontSize(10)
            .text(`Service ID: ${purchase.serviceId}`, 50, rowTop)
            .text(purchase.serviceType, 250, rowTop)
            .text(`₹${purchase.amount.toFixed(2)}`, 450, rowTop, { width: 90, align: 'right' });
        const subtotalTop = rowTop + 50;
        doc
            .text('Subtotal:', 350, subtotalTop)
            .text(`₹${purchase.amount.toFixed(2)}`, 450, subtotalTop, { width: 90, align: 'right' });
        const gst = purchase.amount * 0.18;
        doc
            .text('GST (18%):', 350, subtotalTop + 20)
            .text(`₹${gst.toFixed(2)}`, 450, subtotalTop + 20, { width: 90, align: 'right' });
        const total = purchase.amount + gst;
        doc
            .fontSize(12)
            .text('Total:', 350, subtotalTop + 45)
            .text(`₹${total.toFixed(2)}`, 450, subtotalTop + 45, { width: 90, align: 'right' });
        doc
            .moveTo(350, subtotalTop + 65)
            .lineTo(550, subtotalTop + 65)
            .stroke();
        doc
            .fontSize(10)
            .fillColor('green')
            .text(`Payment Status: ${purchase.paymentStatus}`, 50, subtotalTop + 80)
            .fillColor('black')
            .text(`Payment Method: ${purchase.paymentMethod}`, 50, subtotalTop + 95);
        doc
            .fontSize(8)
            .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 })
            .text('This is a computer-generated invoice.', 50, 715, { align: 'center', width: 500 });
        doc.end();
        stream.on('finish', () => {
            resolve(`invoices/${fileName}`);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
}
