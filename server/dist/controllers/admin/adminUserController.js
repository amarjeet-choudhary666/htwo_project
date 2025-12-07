"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserController = void 0;
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.adminUserController = {
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const role = req.query.role || '';
            const where = {};
            if (search) {
                where.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstname: { contains: search, mode: 'insensitive' } },
                    { companyName: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (role && role !== '') {
                where.role = role.toUpperCase();
                console.log('Filtering by role:', role.toUpperCase());
            }
            const [users, total] = await Promise.all([
                prisma_1.prisma.user.findMany({
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
                prisma_1.prisma.user.count({ where })
            ]);
            console.log('Users query result:', { where, total, usersCount: users.length });
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
            const user = await prisma_1.prisma.user.findUnique({
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
            const { firstname, email, address, companyName } = req.body;
            await prisma_1.prisma.user.update({
                where: { id: parseInt(id) },
                data: { firstname, email, address, companyName }
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
            await prisma_1.prisma.user.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, message: 'Error deleting user' });
        }
    },
    async createUser(req, res) {
        try {
            const { email, password, firstname, address, companyName, gstNumber, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstname,
                    address,
                    companyName,
                    gstNumber,
                    role: role || 'USER'
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    role: true,
                    address: true,
                    companyName: true,
                    gstNumber: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        }
        catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating user'
            });
        }
    },
    async exportUsers(_req, res) {
        try {
            const users = await prisma_1.prisma.user.findMany({
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
    }
};
