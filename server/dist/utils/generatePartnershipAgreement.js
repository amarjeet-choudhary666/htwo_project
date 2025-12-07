"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePartnershipAgreement = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("./cloudinary");
const generatePartnershipAgreement = async (partner) => {
    return new Promise(async (resolve, reject) => {
        try {
            const tempDir = path_1.default.join(__dirname, '../../temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `partnership_agreement_${partner.id}_${Date.now()}.pdf`;
            const filePath = path_1.default.join(tempDir, fileName);
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50
            });
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(20).text('H2 Technologies', { align: 'center' });
            doc.fontSize(16).text('Partnership Agreement', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Agreement Number: PA-${partner.id.toString().padStart(6, '0')}`);
            doc.text(`Date: ${partner.agreementDate.toLocaleDateString()}`);
            doc.moveDown();
            doc.fontSize(12).text('Partner Information:', { underline: true });
            doc.fontSize(10);
            doc.text(`Company Name: ${partner.companyName}`);
            doc.text(`Contact Person: ${partner.fullName}`);
            if (partner.jobTitle)
                doc.text(`Job Title: ${partner.jobTitle}`);
            doc.text(`Email: ${partner.email}`);
            if (partner.phone)
                doc.text(`Phone: ${partner.phone}`);
            if (partner.countryRegion)
                doc.text(`Country/Region: ${partner.countryRegion}`);
            if (partner.website)
                doc.text(`Website: ${partner.website}`);
            if (partner.businessType)
                doc.text(`Business Type: ${partner.businessType}`);
            if (partner.yearEstablished)
                doc.text(`Year Established: ${partner.yearEstablished}`);
            if (partner.numberOfEmployees)
                doc.text(`Number of Employees: ${partner.numberOfEmployees}`);
            doc.moveDown();
            doc.fontSize(12).text('Partnership Details:', { underline: true });
            doc.fontSize(10);
            if (partner.preferredPartnershipType)
                doc.text(`Partnership Type: ${partner.preferredPartnershipType}`);
            if (partner.estimatedMonthlyVpsSales)
                doc.text(`Estimated Monthly VPS Sales: ${partner.estimatedMonthlyVpsSales}`);
            if (partner.partnershipReason) {
                doc.text('Partnership Reason:');
                doc.text(partner.partnershipReason);
            }
            doc.moveDown();
            doc.fontSize(12).text('Additional Information:', { underline: true });
            doc.fontSize(10);
            doc.text(`Technical Support Team: ${partner.hasTechnicalSupport ? 'Yes' : 'No'}`);
            doc.text(`Handles Customer Billing: ${partner.handlesBilling ? 'Yes' : 'No'}`);
            if (partner.currentPartners) {
                doc.text('Current Partners:');
                doc.text(partner.currentPartners);
            }
            if (partner.comments) {
                doc.text('Comments:');
                doc.text(partner.comments);
            }
            doc.moveDown();
            doc.fontSize(12).text('Agreement Terms:', { underline: true });
            doc.fontSize(10);
            doc.text('1. This partnership agreement is entered into between H2 Technologies and the above-mentioned partner.');
            doc.text('2. The partner agrees to promote H2 Technologies services in accordance with the agreed partnership type.');
            doc.text('3. Both parties agree to maintain confidentiality of proprietary information.');
            doc.text('4. This agreement is effective from the date of approval and continues until terminated by either party.');
            doc.text('5. H2 Technologies reserves the right to terminate this agreement with 30 days notice.');
            doc.moveDown();
            doc.fontSize(12).text('Signature:', { underline: true });
            doc.fontSize(10);
            doc.text(`Digital Signature: ${partner.signature}`);
            doc.text(`Date: ${partner.agreementDate.toLocaleDateString()}`);
            doc.moveDown(2);
            doc.fontSize(8).text('This agreement is electronically generated and legally binding.', { align: 'center' });
            doc.text('H2 Technologies - Cloud & Server Solutions', { align: 'center' });
            doc.end();
            stream.on('finish', async () => {
                try {
                    const cloudinaryUrl = await (0, cloudinary_1.uploadToCloudinary)(filePath, 'partnerships');
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
exports.generatePartnershipAgreement = generatePartnershipAgreement;
