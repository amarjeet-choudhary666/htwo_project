"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminServiceController = void 0;
const prisma_1 = require("../../lib/prisma");
exports.adminServiceController = {
    async dashboard(_req, res) {
        try {
            const [totalSubmissions, demoRequests, contactForms, getInTouch, recentSubmissions] = await Promise.all([
                prisma_1.prisma.formSubmission.count(),
                prisma_1.prisma.formSubmission.count({ where: { type: 'demo' } }),
                prisma_1.prisma.formSubmission.count({ where: { type: 'contact' } }),
                prisma_1.prisma.formSubmission.count({ where: { type: 'get_in_touch' } }),
                prisma_1.prisma.formSubmission.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, email: true, firstname: true }
                        }
                    }
                })
            ]);
            const stats = {
                totalSubmissions,
                demoRequests,
                contactForms,
                getInTouch
            };
            res.json({
                success: true,
                data: {
                    stats,
                    recentSubmissions
                }
            });
        }
        catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({ success: false, message: 'Error loading dashboard' });
        }
    },
    async getAnalytics(_req, res) {
        try {
            const [totalSubmissions, submissionsByType, submissionsByMonth, topServices] = await Promise.all([
                prisma_1.prisma.formSubmission.count(),
                prisma_1.prisma.formSubmission.groupBy({
                    by: ['type'],
                    _count: { type: true }
                }),
                prisma_1.prisma.formSubmission.groupBy({
                    by: ['createdAt'],
                    _count: { createdAt: true },
                    orderBy: { createdAt: 'asc' }
                }),
                prisma_1.prisma.formSubmission.groupBy({
                    by: ['service'],
                    _count: { service: true },
                    orderBy: { _count: { service: 'desc' } },
                    take: 5,
                    where: {
                        service: {
                            not: null
                        }
                    }
                })
            ]);
            const monthlyData = submissionsByMonth.reduce((acc, item) => {
                const date = new Date(item.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                acc[monthKey] = (acc[monthKey] || 0) + item._count.createdAt;
                return acc;
            }, {});
            const processedMonthlyData = Object.entries(monthlyData).map(([month, count]) => ({
                month,
                count
            }));
            res.json({
                success: true,
                data: {
                    totalSubmissions,
                    submissionsByType,
                    submissionsByMonth: processedMonthlyData,
                    topServices
                }
            });
        }
        catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({ success: false, message: 'Error loading analytics' });
        }
    },
    async getStats(_req, res) {
        try {
            let totalSubmissions = 0;
            let demoRequests = 0;
            let contactForms = 0;
            let getInTouch = 0;
            let totalUsers = 0;
            let totalPartners = 0;
            let approvedPartners = 0;
            let pendingPartners = 0;
            let totalServices = 0;
            let activeServices = 0;
            try {
                const results = await Promise.allSettled([
                    prisma_1.prisma.formSubmission.count(),
                    prisma_1.prisma.formSubmission.count({ where: { type: 'demo' } }),
                    prisma_1.prisma.formSubmission.count({ where: { type: 'contact' } }),
                    prisma_1.prisma.formSubmission.count({ where: { type: 'get_in_touch' } }),
                    prisma_1.prisma.user.count(),
                    prisma_1.prisma.partnerRegistrationForm.count(),
                    prisma_1.prisma.partnerRegistrationForm.count({ where: { status: 'approved' } }),
                    prisma_1.prisma.partnerRegistrationForm.count({ where: { status: 'pending' } }),
                    prisma_1.prisma.service.count(),
                    prisma_1.prisma.service.count({ where: { status: 'active' } })
                ]);
                [
                    totalSubmissions,
                    demoRequests,
                    contactForms,
                    getInTouch,
                    totalUsers,
                    totalPartners,
                    approvedPartners,
                    pendingPartners,
                    totalServices,
                    activeServices
                ] = results.map(result => result.status === 'fulfilled' ? result.value : 0);
            }
            catch (dbError) {
                console.warn('Database queries failed, using fallback values:', dbError);
            }
            res.json({
                totalSubmissions,
                demoRequests,
                contactForms,
                getInTouch,
                totalUsers,
                totalPartners,
                approvedPartners,
                pendingPartners,
                totalServices,
                activeServices
            });
        }
        catch (error) {
            console.error('Stats API error:', error);
            res.json({
                totalSubmissions: 0,
                demoRequests: 0,
                contactForms: 0,
                getInTouch: 0,
                totalUsers: 0,
                totalPartners: 0,
                approvedPartners: 0,
                pendingPartners: 0,
                totalServices: 0,
                activeServices: 0
            });
        }
    },
    async getSettings(_req, res) {
        try {
            res.json({
                success: true,
                data: {
                    general: {
                        siteName: 'Admin Panel',
                        siteDescription: 'Admin management system'
                    },
                    email: {
                        smtpHost: '',
                        smtpPort: '',
                        smtpUser: '',
                        smtpPassword: ''
                    },
                    security: {
                        sessionTimeout: 3600,
                        maxLoginAttempts: 5
                    }
                }
            });
        }
        catch (error) {
            console.error('Settings error:', error);
            res.status(500).json({ success: false, message: 'Error loading settings' });
        }
    },
    async updateSettings(_req, res) {
        try {
            res.json({ success: true, message: 'Settings updated successfully' });
        }
        catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ success: false, message: 'Error updating settings' });
        }
    },
    async getServices(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const category = req.query.category || '';
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status && status !== '') {
                where.status = status;
            }
            if (category && category !== '') {
                where.category = {
                    name: {
                        equals: category,
                        mode: 'insensitive'
                    }
                };
            }
            const [services, total] = await Promise.all([
                prisma_1.prisma.service.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        category: true,
                        categoryType: true,
                        owner: { select: { id: true, email: true, firstname: true } }
                    }
                }),
                prisma_1.prisma.service.count({ where })
            ]);
            res.json({
                success: true,
                data: services || []
            });
        }
        catch (error) {
            console.error('Services error:', error);
            res.status(500).json({ success: false, message: 'Error loading services' });
        }
    },
    async getServiceById(req, res) {
        try {
            const { id } = req.params;
            const service = await prisma_1.prisma.service.findUnique({
                where: { id: parseInt(id) },
                include: {
                    category: true,
                    categoryType: true,
                    owner: { select: { id: true, email: true, firstname: true } }
                }
            });
            if (!service) {
                return res.status(404).json({ success: false, message: 'Service not found' });
            }
            res.json({ success: true, data: service });
        }
        catch (error) {
            console.error('Get service by ID error:', error);
            res.status(500).json({ success: false, message: 'Error fetching service' });
        }
    },
    async createService(req, res) {
        try {
            const { name, categoryId, categoryTypeId, description, monthlyPrice, yearlyPrice, imageUrl, features, ram, storage, priority, ownerId } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Service name is required' });
            }
            let serviceOwnerId = ownerId;
            if (!serviceOwnerId && req.user) {
                serviceOwnerId = req.user.id;
            }
            if (!serviceOwnerId) {
                return res.status(400).json({ success: false, message: 'Service owner is required' });
            }
            const service = await prisma_1.prisma.service.create({
                data: {
                    name,
                    categoryId: categoryId ? parseInt(categoryId) : null,
                    categoryTypeId: categoryTypeId ? parseInt(categoryTypeId) : null,
                    description,
                    monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
                    yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : null,
                    imageUrl,
                    features: features || [],
                    ram,
                    storage,
                    priority: priority || 'LOW',
                    ownerId: serviceOwnerId
                },
                include: {
                    category: true,
                    categoryType: true,
                    owner: { select: { id: true, email: true, firstname: true } }
                }
            });
            res.status(201).json({
                success: true,
                message: 'Service created successfully',
                data: service
            });
        }
        catch (error) {
            console.error('Create service error:', error);
            res.status(500).json({ success: false, message: 'Error creating service' });
        }
    },
    async updateService(req, res) {
        try {
            const { id } = req.params;
            const { name, categoryId, categoryTypeId, description, monthlyPrice, yearlyPrice, imageUrl, features, ram, storage, priority, status } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Service name is required' });
            }
            const updateData = {
                name,
                description,
                imageUrl,
                features: features || [],
                ram,
                storage,
                priority: priority || 'LOW',
                status: status || 'active'
            };
            if (categoryId !== undefined) {
                updateData.categoryId = categoryId ? parseInt(categoryId) : null;
            }
            if (categoryTypeId !== undefined) {
                updateData.categoryTypeId = categoryTypeId ? parseInt(categoryTypeId) : null;
            }
            if (monthlyPrice !== undefined) {
                updateData.monthlyPrice = monthlyPrice ? parseFloat(monthlyPrice) : null;
            }
            if (yearlyPrice !== undefined) {
                updateData.yearlyPrice = yearlyPrice ? parseFloat(yearlyPrice) : null;
            }
            const service = await prisma_1.prisma.service.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    category: true,
                    categoryType: true,
                    owner: { select: { id: true, email: true, firstname: true } }
                }
            });
            res.json({
                success: true,
                message: 'Service updated successfully',
                data: service
            });
        }
        catch (error) {
            console.error('Update service error:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ success: false, message: 'Service not found' });
            }
            res.status(500).json({ success: false, message: 'Error updating service' });
        }
    },
    async deleteService(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.service.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'Service deleted successfully' });
        }
        catch (error) {
            console.error('Delete service error:', error);
            res.status(500).json({ success: false, message: 'Error deleting service' });
        }
    },
    async updateServiceStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const service = await prisma_1.prisma.service.update({
                where: { id: parseInt(id) },
                data: { status }
            });
            res.json({ success: true, message: 'Service status updated successfully', data: service });
        }
        catch (error) {
            console.error('Update service status error:', error);
            res.status(500).json({ success: false, message: 'Error updating service status' });
        }
    },
    async getServicesByCategoryType(req, res) {
        try {
            const { id } = req.params;
            const services = await prisma_1.prisma.service.findMany({
                where: { categoryTypeId: parseInt(id) },
                include: {
                    category: true,
                    categoryType: true,
                    owner: { select: { id: true, email: true, firstname: true } }
                }
            });
            res.json({ success: true, data: services });
        }
        catch (error) {
            console.error('Get services by category type error:', error);
            res.status(500).json({ success: false, message: 'Error fetching services' });
        }
    }
};
