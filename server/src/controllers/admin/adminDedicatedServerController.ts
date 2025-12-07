import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { dedicatedServerFormSchema, DedicatedServerFormInput } from '../../validation/dedicatedServerValidation';

export const adminDedicatedServerController = {
  // Get dedicated servers
  async getDedicatedServers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const chip = req.query.chip as string; // 'AMD' or 'INTEL' or undefined for all

      const where: any = {};
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
        prisma.dedicatedServer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.dedicatedServer.count({ where })
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
    } catch (error) {
      console.error('Dedicated servers error:', error);
      res.status(500).json({ success: false, message: 'Error loading dedicated servers' });
    }
  },

  // Create dedicated server
  async createDedicatedServer(req: Request, res: Response) {
    try {
      const data: DedicatedServerFormInput = req.body;

      const validatedData = dedicatedServerFormSchema.parse(data);

      const dedicatedServer = await prisma.dedicatedServer.create({
        data: validatedData
      });

      res.json({ success: true, message: 'Dedicated server created successfully', dedicatedServer });
    } catch (error: any) {
      console.error('Create dedicated server error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Error creating dedicated server' });
    }
  },

  // Update dedicated server
  async updateDedicatedServer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: Partial<DedicatedServerFormInput> = req.body;

      // Get existing server
      const existingServer = await prisma.dedicatedServer.findUnique({
        where: { id }
      });

      if (!existingServer) {
        return res.status(404).json({ success: false, message: 'Dedicated server not found' });
      }

      // For update, we need to merge with existing data and validate
      const updateData = { ...existingServer, ...data };
      const validatedData = dedicatedServerFormSchema.parse(updateData);

      const updatedServer = await prisma.dedicatedServer.update({
        where: { id },
        data: validatedData
      });

      res.json({ success: true, message: 'Dedicated server updated successfully', dedicatedServer: updatedServer });
    } catch (error: any) {
      console.error('Update dedicated server error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Error updating dedicated server' });
    }
  },

  // Delete dedicated server
  async deleteDedicatedServer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.dedicatedServer.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Dedicated server deleted successfully' });
    } catch (error) {
      console.error('Delete dedicated server error:', error);
      res.status(500).json({ success: false, message: 'Error deleting dedicated server' });
    }
  }
};