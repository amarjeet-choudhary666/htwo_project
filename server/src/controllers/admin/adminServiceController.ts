import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

interface AuthRequest extends Request {
  user?: any;
}

export const adminServiceController = {
  // Dashboard
  async dashboard(_req: Request, res: Response) {
    try {
      // Get statistics
      const [totalSubmissions, demoRequests, contactForms, getInTouch, recentSubmissions] = await Promise.all([
        prisma.formSubmission.count(),
        prisma.formSubmission.count({ where: { type: 'demo' } }),
        prisma.formSubmission.count({ where: { type: 'contact' } }),
        prisma.formSubmission.count({ where: { type: 'get_in_touch' } }),
        prisma.formSubmission.findMany({
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
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: 'Error loading dashboard' });
    }
  },

  // Get analytics
  async getAnalytics(_req: Request, res: Response) {
    try {
      // Get analytics data
      const [
        totalSubmissions,
        submissionsByType,
        submissionsByMonth,
        topServices
      ] = await Promise.all([
        prisma.formSubmission.count(),
        prisma.formSubmission.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        prisma.formSubmission.groupBy({
          by: ['createdAt'],
          _count: { createdAt: true },
          orderBy: { createdAt: 'asc' }
        }),
        prisma.formSubmission.groupBy({
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

      // Process submissionsByMonth to group by month
      const monthlyData = submissionsByMonth.reduce((acc: any, item) => {
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
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ success: false, message: 'Error loading analytics' });
    }
  },

  // Get stats API
  async getStats(_req: Request, res: Response) {
    try {
      // Provide fallback values in case database queries fail
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
          prisma.formSubmission.count(),
          prisma.formSubmission.count({ where: { type: 'demo' } }),
          prisma.formSubmission.count({ where: { type: 'contact' } }),
          prisma.formSubmission.count({ where: { type: 'get_in_touch' } }),
          prisma.user.count(),
          prisma.partnerRegistrationForm.count(),
          prisma.partnerRegistrationForm.count({ where: { status: 'approved' } }),
          prisma.partnerRegistrationForm.count({ where: { status: 'pending' } }),
          prisma.service.count(),
          prisma.service.count({ where: { status: 'active' } })
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
        ] = results.map(result =>
          result.status === 'fulfilled' ? result.value : 0
        );
      } catch (dbError) {
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
    } catch (error) {
      console.error('Stats API error:', error);
      // Return fallback values even on error
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

  // Get settings
  async getSettings(_req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          // Add settings data here
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
    } catch (error) {
      console.error('Settings error:', error);
      res.status(500).json({ success: false, message: 'Error loading settings' });
    }
  },

  // Update settings
  async updateSettings(_req: Request, res: Response) {
    try {
      // Implement settings update logic
      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ success: false, message: 'Error updating settings' });
    }
  },

  // Get all services
  async getServices(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const status = req.query.status as string || '';
      const category = req.query.category as string || '';

      const where: any = {};
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
        prisma.service.findMany({
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
        prisma.service.count({ where })
      ]);

      res.json({
        success: true,
        data: services || []
      });
    } catch (error) {
      console.error('Services error:', error);
      res.status(500).json({ success: false, message: 'Error loading services' });
    }
  },

  // Get service by ID
  async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
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
    } catch (error) {
      console.error('Get service by ID error:', error);
      res.status(500).json({ success: false, message: 'Error fetching service' });
    }
  },

  // Create service
  async createService(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        categoryId,
        categoryTypeId,
        description,
        monthlyPrice,
        yearlyPrice,
        imageUrl,
        features,
        ram,
        storage,
        priority,
        ownerId
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ success: false, message: 'Service name is required' });
      }

      // Get admin user as owner (required field)
      let serviceOwnerId = ownerId;
      if (!serviceOwnerId && req.user) {
        serviceOwnerId = req.user.id;
      }

      if (!serviceOwnerId) {
        return res.status(400).json({ success: false, message: 'Service owner is required' });
      }

      const service = await prisma.service.create({
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
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ success: false, message: 'Error creating service' });
    }
  },

  // Update service
  async updateService(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryId,
        categoryTypeId,
        description,
        monthlyPrice,
        yearlyPrice,
        imageUrl,
        features,
        ram,
        storage,
        priority,
        status
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ success: false, message: 'Service name is required' });
      }

      const updateData: any = {
        name,
        description,
        imageUrl,
        features: features || [],
        ram,
        storage,
        priority: priority || 'LOW',
        status: status || 'active'
      };

      // Handle optional fields
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

      const service = await prisma.service.update({
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
    } catch (error: any) {
      console.error('Update service error:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      res.status(500).json({ success: false, message: 'Error updating service' });
    }
  },

  // Delete service
  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.service.delete({
        where: { id: parseInt(id) }
      });
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({ success: false, message: 'Error deleting service' });
    }
  },

  // Update service status
  async updateServiceStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const service = await prisma.service.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      res.json({ success: true, message: 'Service status updated successfully', data: service });
    } catch (error) {
      console.error('Update service status error:', error);
      res.status(500).json({ success: false, message: 'Error updating service status' });
    }
  },

  // Get services by category type
  async getServicesByCategoryType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const services = await prisma.service.findMany({
        where: { categoryTypeId: parseInt(id) },
        include: {
          category: true,
          categoryType: true,
          owner: { select: { id: true, email: true, firstname: true } }
        }
      });
      res.json({ success: true, data: services });
    } catch (error) {
      console.error('Get services by category type error:', error);
      res.status(500).json({ success: false, message: 'Error fetching services' });
    }
  }
};