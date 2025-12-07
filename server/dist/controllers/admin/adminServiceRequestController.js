"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectServiceRequest = exports.approveServiceRequest = exports.getAllServiceRequests = void 0;
const prisma_1 = require("../../lib/prisma");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const asyncHandler_1 = require("../../utils/asyncHandler");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.getAllServiceRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.query;
    const where = status ? { status: status } : {};
    const requests = await prisma_1.prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, requests, 'Service requests retrieved successfully'));
});
exports.approveServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { amount, adminNotes } = req.body;
    if (!amount) {
        throw new apiError_1.ApiError(400, 'Amount is required');
    }
    const request = await prisma_1.prisma.serviceRequest.findUnique({
        where: { id: parseInt(id) }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    if (request.status !== 'PENDING') {
        throw new apiError_1.ApiError(400, 'Service request has already been processed');
    }
    const expiresAt = new Date();
    switch (request.billingCycle) {
        case 'YEARLY':
            expiresAt.setDate(expiresAt.getDate() + 365);
            break;
        case 'QUARTERLY':
            expiresAt.setDate(expiresAt.getDate() + 90);
            break;
        case 'MONTHLY':
        default:
            expiresAt.setDate(expiresAt.getDate() + 31);
            break;
    }
    let user = await prisma_1.prisma.user.findUnique({
        where: { email: request.email }
    });
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                email: request.email,
                password: '',
                firstname: request.fullName,
                companyName: request.companyName,
                gstNumber: request.gstNumber,
                address: request.address,
                role: 'USER'
            }
        });
    }
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId: user.id,
            serviceId: request.vpsPlan,
            serviceType: 'SERVER',
            amount: parseFloat(amount),
            paymentMethod: 'partner_request',
            paymentStatus: 'COMPLETED',
            transactionId: `REQ${request.id}-${Date.now()}`,
            expiresAt,
            planType: request.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
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
    const invoicePath = await generateInvoice(purchase, request);
    await prisma_1.prisma.purchase.update({
        where: { id: purchase.id },
        data: { invoicePdf: invoicePath }
    });
    const updatedRequest = await prisma_1.prisma.serviceRequest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'APPROVED',
            adminNotes,
            approvedBy: adminId,
            approvedAt: new Date(),
            invoiceId: purchase.id
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, { request: updatedRequest, purchase }, 'Service request approved and invoice generated'));
});
exports.rejectServiceRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const request = await prisma_1.prisma.serviceRequest.findUnique({
        where: { id: parseInt(id) }
    });
    if (!request) {
        throw new apiError_1.ApiError(404, 'Service request not found');
    }
    if (request.status !== 'PENDING') {
        throw new apiError_1.ApiError(400, 'Service request has already been processed');
    }
    const updatedRequest = await prisma_1.prisma.serviceRequest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'REJECTED',
            adminNotes
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedRequest, 'Service request rejected'));
});
async function generateInvoice(purchase, request) {
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
        doc
            .fontSize(12)
            .text('Service Details:', 50, 260)
            .fontSize(10)
            .text(`VPS Plan: ${request.vpsPlan}`, 50, 280)
            .text(`Server Location: ${request.serverLocation}`, 50, 295)
            .text(`Billing Cycle: ${request.billingCycle}`, 50, 310)
            .text(`Expires On: ${new Date(purchase.expiresAt).toLocaleDateString()}`, 50, 325);
        const tableTop = 360;
        doc
            .fontSize(10)
            .text('Description', 50, tableTop)
            .text('Billing Cycle', 250, tableTop)
            .text('Amount', 450, tableTop, { width: 90, align: 'right' });
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();
        const rowTop = tableTop + 25;
        doc
            .fontSize(10)
            .text(`${request.vpsPlan} VPS`, 50, rowTop)
            .text(request.billingCycle, 250, rowTop)
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
            .fillColor('black');
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
