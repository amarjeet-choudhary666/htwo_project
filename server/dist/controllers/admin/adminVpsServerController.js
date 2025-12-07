"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminVpsServerController = void 0;
const prisma_1 = require("../../lib/prisma");
const vpsServerValidation_1 = require("../../validation/vpsServerValidation");
exports.adminVpsServerController = {
    async getVpsServers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const os = req.query.os;
            const where = {};
            if (search) {
                where.name = { contains: search, mode: 'insensitive' };
            }
            if (os && ['LINUX', 'WINDOWS'].includes(os)) {
                where.os = os;
            }
            const [vpsServers, total] = await Promise.all([
                prisma_1.prisma.vpsServer.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.prisma.vpsServer.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    vpsServers,
                    pagination: {
                        current: page,
                        total: Math.ceil(total / limit),
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    },
                    total
                }
            });
        }
        catch (error) {
            console.error('VPS servers error:', error);
            res.status(500).json({ success: false, message: 'Error loading VPS servers' });
        }
    },
    async createVpsServer(req, res) {
        try {
            const data = req.body;
            let validatedData;
            if (data.os === 'LINUX') {
                validatedData = vpsServerValidation_1.createLinuxVpsSchema.parse(data);
            }
            else if (data.os === 'WINDOWS') {
                validatedData = vpsServerValidation_1.createWindowsVpsSchema.parse(data);
            }
            else {
                return res.status(400).json({ success: false, message: 'Invalid OS type' });
            }
            const vpsServer = await prisma_1.prisma.vpsServer.create({
                data: validatedData
            });
            res.json({ success: true, message: 'VPS server created successfully', vpsServer });
        }
        catch (error) {
            console.error('Create VPS server error:', error);
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ success: false, message: 'Error creating VPS server' });
        }
    },
    async updateVpsServer(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const existingServer = await prisma_1.prisma.vpsServer.findUnique({
                where: { id: parseInt(id) }
            });
            if (!existingServer) {
                return res.status(404).json({ success: false, message: 'VPS server not found' });
            }
            let validatedData;
            if (existingServer.os === 'LINUX') {
                validatedData = vpsServerValidation_1.updateLinuxVpsSchema.parse(data);
            }
            else {
                validatedData = vpsServerValidation_1.updateWindowsVpsSchema.parse(data);
            }
            const updatedServer = await prisma_1.prisma.vpsServer.update({
                where: { id: parseInt(id) },
                data: validatedData
            });
            res.json({ success: true, message: 'VPS server updated successfully', vpsServer: updatedServer });
        }
        catch (error) {
            console.error('Update VPS server error:', error);
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ success: false, message: 'Error updating VPS server' });
        }
    },
    async deleteVpsServer(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.vpsServer.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'VPS server deleted successfully' });
        }
        catch (error) {
            console.error('Delete VPS server error:', error);
            res.status(500).json({ success: false, message: 'Error deleting VPS server' });
        }
    }
};
