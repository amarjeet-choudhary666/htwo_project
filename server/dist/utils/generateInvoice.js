"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoice = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("./cloudinary");
const generateInvoice = async (purchase) => {
    return new Promise(async (resolve, reject) => {
        try {
            const tempDir = path_1.default.join(__dirname, '../../temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `invoice_${purchase.id}_${Date.now()}.pdf`;
            const filePath = path_1.default.join(tempDir, fileName);
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50
            });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(20).text('H2 Technologies', { align: 'center' });
            doc.fontSize(12).text('Invoice', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Invoice Number: INV-${purchase.id.toString().padStart(6, '0')}`);
            doc.text(`Date: ${purchase.createdAt.toLocaleDateString()}`);
            doc.text(`Transaction ID: ${purchase.transactionId || 'N/A'}`);
            doc.moveDown();
            doc.fontSize(12).text('Bill To:', { underline: true });
            doc.fontSize(10);
            doc.text(`${purchase.user.firstname || 'Customer'}`);
            doc.text(`${purchase.user.email}`);
            if (purchase.user.companyName)
                doc.text(`${purchase.user.companyName}`);
            if (purchase.user.address)
                doc.text(`${purchase.user.address}`);
            if (purchase.user.gstNumber)
                doc.text(`GST: ${purchase.user.gstNumber}`);
            doc.moveDown();
            doc.fontSize(12).text('Service Details:', { underline: true });
            doc.fontSize(10);
            doc.text(`Service Type: ${purchase.serviceType}`);
            doc.text(`Service ID: ${purchase.serviceId}`);
            doc.text(`Payment Method: ${purchase.paymentMethod || 'N/A'}`);
            doc.text(`Payment Status: ${purchase.paymentStatus}`);
            doc.moveDown();
            doc.fontSize(12).text('Amount:', { underline: true });
            doc.fontSize(10);
            doc.text(`${purchase.currency} ${purchase.amount.toFixed(2)}`);
            doc.moveDown(2);
            doc.fontSize(8).text('Thank you for your business!', { align: 'center' });
            doc.text('H2 Technologies - Cloud & Server Solutions', { align: 'center' });
            doc.end();
            stream.on('finish', async () => {
                try {
                    const cloudinaryUrl = await (0, cloudinary_1.uploadToCloudinary)(filePath, 'invoices');
                    resolve(cloudinaryUrl);
                }
                catch (uploadError) {
                    reject(uploadError);
                }
            });
            stream.on('error', (error) => {
                reject(error);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateInvoice = generateInvoice;
