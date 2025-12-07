"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDedicatedServerController = void 0;
const prisma_1 = require("../../lib/prisma");
const dedicatedServerValidation_1 = require("../../validation/dedicatedServerValidation");
exports.adminDedicatedServerController = {
    async getDedicatedServers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const chip = req.query.chip;
            const where = {};
            if (search) {
                where.OR = [
                    { processorModel: { contains: search, mode: 'insensitive' } },
                    { primaryDrive: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (chip && ['AMD', 'INTEL'].includes(chip)) {
                where.chip = chip;
            }
            const [dedicatedServers, total] = await Promise.all([
                prisma_1.prisma.dedicatedServer.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.prisma.dedicatedServer.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    dedicatedServers,
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
            console.error('Dedicated servers error:', error);
            res.status(500).json({ success: false, message: 'Error loading dedicated servers' });
        }
    },
    async createDedicatedServer(req, res) {
        try {
            const data = req.body;
            const validatedData = dedicatedServerValidation_1.dedicatedServerFormSchema.parse(data);
            const dedicatedServer = await prisma_1.prisma.dedicatedServer.create({
                data: validatedData
            });
            res.json({ success: true, message: 'Dedicated server created successfully', dedicatedServer });
        }
        catch (error) {
            console.error('Create dedicated server error:', error);
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ success: false, message: 'Error creating dedicated server' });
        }
    },
    async updateDedicatedServer(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const existingServer = await prisma_1.prisma.dedicatedServer.findUnique({
                where: { id }
            });
            if (!existingServer) {
                return res.status(404).json({ success: false, message: 'Dedicated server not found' });
            }
            const updateData = { ...existingServer, ...data };
            const validatedData = dedicatedServerValidation_1.dedicatedServerFormSchema.parse(updateData);
            const updatedServer = await prisma_1.prisma.dedicatedServer.update({
                where: { id },
                data: validatedData
            });
            res.json({ success: true, message: 'Dedicated server updated successfully', dedicatedServer: updatedServer });
        }
        catch (error) {
            console.error('Update dedicated server error:', error);
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ success: false, message: 'Error updating dedicated server' });
        }
    },
    async deleteDedicatedServer(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.dedicatedServer.delete({
                where: { id }
            });
            res.json({ success: true, message: 'Dedicated server deleted successfully' });
        }
        catch (error) {
            console.error('Delete dedicated server error:', error);
            res.status(500).json({ success: false, message: 'Error deleting dedicated server' });
        }
    }
};
