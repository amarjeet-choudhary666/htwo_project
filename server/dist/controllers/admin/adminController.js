"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const userValidation_1 = require("../../validation/userValidation");
const categoryValidation_1 = require("../../validation/categoryValidation");
const formSubmissionValidation_1 = require("../../validation/formSubmissionValidation");
const prisma_1 = __importDefault(require("../../lib/prisma"));
exports.adminController = {
    async dashboard(_req, res) {
        try {
            const [totalSubmissions, demoRequests, contactForms, getInTouch, recentSubmissions] = await Promise.all([
                prisma_1.default.formSubmission.count(),
                prisma_1.default.formSubmission.count({ where: { type: 'demo' } }),
                prisma_1.default.formSubmission.count({ where: { type: 'contact' } }),
                prisma_1.default.formSubmission.count({ where: { type: 'get_in_touch' } }),
                prisma_1.default.formSubmission.findMany({
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
    async getAllSubmissions(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const type = req.query.type || '';
            const where = {};
            if (type) {
                where.type = type;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                where.status = status;
            }
            const [submissions, total] = await Promise.all([
                prisma_1.default.formSubmission.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, email: true, firstname: true }
                        }
                    }
                }),
                prisma_1.default.formSubmission.count({ where })
            ]);
            const totalPages = Math.ceil(total / limit);
            res.json({
                success: true,
                data: {
                    submissions,
                    pagination: {
                        current: page,
                        total: totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    },
                    filters: { search, status, type },
                    total
                }
            });
        }
        catch (error) {
            console.error('All submissions error:', error);
            res.status(500).json({ success: false, message: 'Error loading submissions' });
        }
    },
    async getDemoRequests(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const where = { type: 'demo' };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                where.status = status;
            }
            const [submissions, total] = await Promise.all([
                prisma_1.default.formSubmission.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, email: true, firstname: true }
                        }
                    }
                }),
                prisma_1.default.formSubmission.count({ where })
            ]);
            const totalPages = Math.ceil(total / limit);
            res.json({
                success: true,
                data: {
                    submissions,
                    pagination: {
                        current: page,
                        total: totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    },
                    filters: { search, status },
                    total
                }
            });
        }
        catch (error) {
            console.error('Demo requests error:', error);
            res.status(500).json({ success: false, message: 'Error loading demo requests' });
        }
    },
    async getContactForms(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const where = { type: 'contact' };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [submissions, total] = await Promise.all([
                prisma_1.default.formSubmission.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.default.formSubmission.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    submissions,
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
            console.error('Contact forms error:', error);
            res.status(500).json({ success: false, message: 'Error loading contact forms' });
        }
    },
    async getInTouchForms(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const [submissions, total] = await Promise.all([
                prisma_1.default.formSubmission.findMany({
                    where: { type: 'get_in_touch' },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.default.formSubmission.count({ where: { type: 'get_in_touch' } })
            ]);
            res.json({
                success: true,
                data: {
                    submissions,
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
            console.error('Get in touch forms error:', error);
            res.status(500).json({ success: false, message: 'Error loading get in touch forms' });
        }
    },
    async getSubmissionDetails(req, res) {
        try {
            const { id } = req.params;
            const submission = await prisma_1.default.formSubmission.findUnique({
                where: { id },
                include: {
                    user: {
                        select: { id: true, email: true, firstname: true, createdAt: true }
                    }
                }
            });
            if (!submission) {
                return res.status(404).json({ success: false, message: 'Submission not found' });
            }
            res.json({ success: true, data: submission });
        }
        catch (error) {
            console.error('Submission details error:', error);
            res.status(500).json({ success: false, message: 'Error loading submission details' });
        }
    },
    async updateSubmissionStatus(req, res) {
        try {
            const { id } = req.params;
            const validatedData = formSubmissionValidation_1.updateFormSubmissionSchema.parse(req.body);
            await prisma_1.default.formSubmission.update({
                where: { id },
                data: validatedData
            });
            res.json({ success: true, message: 'Status updated successfully' });
        }
        catch (error) {
            console.error('Update status error:', error);
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    },
    async deleteSubmission(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.default.formSubmission.delete({
                where: { id }
            });
            res.json({ success: true, message: 'Submission deleted successfully' });
        }
        catch (error) {
            console.error('Delete submission error:', error);
            res.status(500).json({ success: false, message: 'Error deleting submission' });
        }
    },
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const where = {};
            if (search) {
                where.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstname: { contains: search, mode: 'insensitive' } },
                    { companyName: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [users, total] = await Promise.all([
                prisma_1.default.user.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        role: true,
                        address: true,
                        companyName: true,
                        gstNumber: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: { formSubmissions: true }
                        }
                    }
                }),
                prisma_1.default.user.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    users,
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
            console.error('Users error:', error);
            res.status(500).json({ success: false, message: 'Error loading users' });
        }
    },
    async getUserDetails(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma_1.default.user.findUnique({
                where: { id: parseInt(id) },
                include: {
                    formSubmissions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            console.error('User details error:', error);
            res.status(500).json({ success: false, message: 'Error loading user details' });
        }
    },
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const validatedData = userValidation_1.updateUserSchema.parse(req.body);
            await prisma_1.default.user.update({
                where: { id: parseInt(id) },
                data: validatedData
            });
            res.json({ success: true, message: 'User updated successfully' });
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ success: false, message: 'Error updating user' });
        }
    },
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.default.user.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, message: 'Error deleting user' });
        }
    },
    async getAnalytics(_req, res) {
        try {
            const [totalSubmissions, submissionsByType, submissionsByMonth, topServices] = await Promise.all([
                prisma_1.default.formSubmission.count(),
                prisma_1.default.formSubmission.groupBy({
                    by: ['type'],
                    _count: { type: true }
                }),
                prisma_1.default.formSubmission.groupBy({
                    by: ['createdAt'],
                    _count: { createdAt: true },
                    orderBy: { createdAt: 'asc' }
                }),
                prisma_1.default.formSubmission.groupBy({
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
                    prisma_1.default.formSubmission.count(),
                    prisma_1.default.formSubmission.count({ where: { type: 'demo' } }),
                    prisma_1.default.formSubmission.count({ where: { type: 'contact' } }),
                    prisma_1.default.formSubmission.count({ where: { type: 'get_in_touch' } }),
                    prisma_1.default.user.count(),
                    prisma_1.default.partnerRegistrationForm.count(),
                    prisma_1.default.partnerRegistrationForm.count({ where: { status: 'approved' } }),
                    prisma_1.default.partnerRegistrationForm.count({ where: { status: 'pending' } }),
                    prisma_1.default.service.count(),
                    prisma_1.default.service.count({ where: { status: 'active' } })
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
    async exportSubmissions(_req, res) {
        try {
            const submissions = await prisma_1.default.formSubmission.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
            const csv = [
                'ID,Name,Email,Phone,Type,Service,Message,Created At',
                ...submissions.map(s => `${s.id},"${s.name}","${s.email}","${s.phone || ''}","${s.type}","${s.service || ''}","${s.message || ''}","${s.createdAt}"`)
            ].join('\n');
            res.send(csv);
        }
        catch (error) {
            console.error('Export submissions error:', error);
            res.status(500).json({ error: 'Error exporting submissions' });
        }
    },
    async exportUsers(_req, res) {
        try {
            const users = await prisma_1.default.user.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
            const csv = [
                'ID,Email,First Name,Company,Address,Created At',
                ...users.map(u => `${u.id},"${u.email}","${u.firstname || ''}","${u.companyName || ''}","${u.address || ''}","${u.createdAt}"`)
            ].join('\n');
            res.send(csv);
        }
        catch (error) {
            console.error('Export users error:', error);
            res.status(500).json({ error: 'Error exporting users' });
        }
    },
    async bulkDeleteSubmissions(req, res) {
        try {
            const { ids } = req.body;
            await prisma_1.default.formSubmission.deleteMany({
                where: { id: { in: ids } }
            });
            res.json({ success: true, message: 'Submissions deleted successfully' });
        }
        catch (error) {
            console.error('Bulk delete error:', error);
            res.status(500).json({ success: false, message: 'Error deleting submissions' });
        }
    },
    async bulkUpdateStatus(req, res) {
        try {
            const { ids, status } = req.body;
            const validatedStatus = formSubmissionValidation_1.updateFormSubmissionSchema.shape.status.parse(status);
            await prisma_1.default.formSubmission.updateMany({
                where: { id: { in: ids } },
                data: { status: validatedStatus }
            });
            res.json({ success: true, message: 'Status updated successfully' });
        }
        catch (error) {
            console.error('Bulk update error:', error);
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    },
    async getCategories(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const where = {};
            if (search) {
                where.name = { contains: search, mode: 'insensitive' };
            }
            const [categories, total] = await Promise.all([
                prisma_1.default.category.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        categoryTypes: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }),
                prisma_1.default.category.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    categories,
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
            console.error('Categories error:', error);
            res.status(500).json({ success: false, message: 'Error loading categories' });
        }
    },
    async createCategory(req, res) {
        try {
            const validatedData = categoryValidation_1.createCategorySchema.parse(req.body);
            const category = await prisma_1.default.category.create({
                data: validatedData
            });
            res.json({ success: true, message: 'Category created successfully', category });
        }
        catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ success: false, message: 'Error creating category' });
        }
    },
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const validatedData = categoryValidation_1.updateCategorySchema.parse(req.body);
            await prisma_1.default.category.update({
                where: { id: parseInt(id) },
                data: validatedData
            });
            res.json({ success: true, message: 'Category updated successfully' });
        }
        catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ success: false, message: 'Error updating category' });
        }
    },
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.default.category.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'Category deleted successfully' });
        }
        catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ success: false, message: 'Error deleting category' });
        }
    },
    async createCategoryType(req, res) {
        try {
            const validatedData = categoryValidation_1.createCategoryTypeSchema.parse(req.body);
            const categoryType = await prisma_1.default.categoryType.create({
                data: validatedData
            });
            res.json({ success: true, message: 'Category type created successfully', categoryType });
        }
        catch (error) {
            console.error('Create category type error:', error);
            res.status(500).json({ success: false, message: 'Error creating category type' });
        }
    },
    async updateCategoryType(req, res) {
        try {
            const { id } = req.params;
            const validatedData = categoryValidation_1.updateCategoryTypeSchema.parse(req.body);
            await prisma_1.default.categoryType.update({
                where: { id: parseInt(id) },
                data: validatedData
            });
            res.json({ success: true, message: 'Category type updated successfully' });
        }
        catch (error) {
            console.error('Update category type error:', error);
            res.status(500).json({ success: false, message: 'Error updating category type' });
        }
    },
    async getCategoryTypes(req, res) {
        try {
            const { categoryId } = req.params;
            const categoryTypes = await prisma_1.default.categoryType.findMany({
                where: { categoryId: parseInt(categoryId) },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ success: true, data: categoryTypes });
        }
        catch (error) {
            console.error('Get category types error:', error);
            res.status(500).json({ success: false, message: 'Error fetching category types' });
        }
    },
    async deleteCategoryType(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.default.categoryType.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'Category type deleted successfully' });
        }
        catch (error) {
            console.error('Delete category type error:', error);
            res.status(500).json({ success: false, message: 'Error deleting category type' });
        }
    },
    async getAllPartnersWithStatus(req, res) {
        try {
            const [pendingPartners, approvedPartners, rejectedPartners] = await Promise.all([
                prisma_1.default.partnerRegistrationForm.findMany({
                    where: { status: 'pending' },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.default.partnerRegistrationForm.findMany({
                    where: { status: 'approved' },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.default.partnerRegistrationForm.findMany({
                    where: { status: 'rejected' },
                    orderBy: { createdAt: 'desc' }
                })
            ]);
            const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
                prisma_1.default.partnerRegistrationForm.count({ where: { status: 'pending' } }),
                prisma_1.default.partnerRegistrationForm.count({ where: { status: 'approved' } }),
                prisma_1.default.partnerRegistrationForm.count({ where: { status: 'rejected' } }),
                prisma_1.default.partnerRegistrationForm.count()
            ]);
            const summary = {
                total: totalCount,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount
            };
            res.json({
                success: true,
                data: {
                    summary,
                    partners: {
                        pending: pendingPartners,
                        approved: approvedPartners,
                        rejected: rejectedPartners
                    }
                }
            });
        }
        catch (error) {
            console.error('Get partners with status error:', error);
            res.status(500).json({ success: false, message: 'Error loading partners' });
        }
    },
    async getAllPartnersSimple(req, res) {
        try {
            const partners = await prisma_1.default.partnerRegistrationForm.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json({
                success: true,
                data: partners
            });
        }
        catch (error) {
            console.error('Get all partners error:', error);
            res.status(500).json({ success: false, message: 'Error loading partners' });
        }
    },
    async getPartners(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const where = {};
            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { companyName: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status && status !== '') {
                where.status = status;
            }
            const [partners, total] = await Promise.all([
                prisma_1.default.partnerRegistrationForm.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.default.partnerRegistrationForm.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    partners,
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
            console.error('Partners error:', error);
            res.status(500).json({ success: false, message: 'Error loading partners' });
        }
    },
    async getPartnerById(req, res) {
        try {
            const { id } = req.params;
            const partner = await prisma_1.default.partnerRegistrationForm.findUnique({
                where: { id: parseInt(id) }
            });
            if (!partner) {
                return res.status(404).json({ success: false, message: 'Partner not found' });
            }
            res.json({ success: true, data: partner });
        }
        catch (error) {
            console.error('Get partner by ID error:', error);
            res.status(500).json({ success: false, message: 'Error fetching partner' });
        }
    },
};
