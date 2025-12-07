"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCategoryController = void 0;
const prisma_1 = require("../../lib/prisma");
exports.adminCategoryController = {
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
                prisma_1.prisma.category.findMany({
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
                prisma_1.prisma.category.count({ where })
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
            const { name, description } = req.body;
            const category = await prisma_1.prisma.category.create({
                data: { name, description }
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
            const { name, description } = req.body;
            await prisma_1.prisma.category.update({
                where: { id: parseInt(id) },
                data: { name, description }
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
            await prisma_1.prisma.category.delete({
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
            const { name, categoryId } = req.body;
            console.log('Creating category type:', { name, categoryId, type: typeof categoryId });
            if (!name || !name.trim()) {
                return res.status(400).json({ success: false, message: 'Category type name is required' });
            }
            if (!categoryId || isNaN(parseInt(categoryId))) {
                return res.status(400).json({ success: false, message: 'Valid category ID is required' });
            }
            const parsedCategoryId = parseInt(categoryId);
            const category = await prisma_1.prisma.category.findUnique({
                where: { id: parsedCategoryId }
            });
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            const categoryType = await prisma_1.prisma.categoryType.create({
                data: {
                    name: name.trim(),
                    categoryId: parsedCategoryId
                }
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
            const { name } = req.body;
            await prisma_1.prisma.categoryType.update({
                where: { id: parseInt(id) },
                data: { name }
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
            const categoryTypes = await prisma_1.prisma.categoryType.findMany({
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
            await prisma_1.prisma.categoryType.delete({
                where: { id: parseInt(id) }
            });
            res.json({ success: true, message: 'Category type deleted successfully' });
        }
        catch (error) {
            console.error('Delete category type error:', error);
            res.status(500).json({ success: false, message: 'Error deleting category type' });
        }
    }
};
