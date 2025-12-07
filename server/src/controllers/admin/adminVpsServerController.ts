import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { createLinuxVpsSchema, createWindowsVpsSchema, updateLinuxVpsSchema, updateWindowsVpsSchema } from '../../validation/vpsServerValidation';

export const adminVpsServerController = {
  // Get VPS servers
  async getVpsServers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const os = req.query.os as string; // 'LINUX' or 'WINDOWS' or undefined for all

      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      if (os && ['LINUX', 'WINDOWS'].includes(os)) {
        where.os = os;
      }

      const [vpsServers, total] = await Promise.all([
        prisma.vpsServer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.vpsServer.count({ where })
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
    } catch (error) {
      console.error('VPS servers error:', error);
      res.status(500).json({ success: false, message: 'Error loading VPS servers' });
    }
  },

  // Create VPS server
  async createVpsServer(req: Request, res: Response) {
    try {
      const data = req.body;

      let validatedData;
      if (data.os === 'LINUX') {
        validatedData = createLinuxVpsSchema.parse(data);
      } else if (data.os === 'WINDOWS') {
        validatedData = createWindowsVpsSchema.parse(data);
      } else {
        return res.status(400).json({ success: false, message: 'Invalid OS type' });
      }

      const vpsServer = await prisma.vpsServer.create({
        data: validatedData
      });

      res.json({ success: true, message: 'VPS server created successfully', vpsServer });
    } catch (error: any) {
      console.error('Create VPS server error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Error creating VPS server' });
    }
  },

  // Update VPS server
  async updateVpsServer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Get existing server to know the OS
      const existingServer = await prisma.vpsServer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingServer) {
        return res.status(404).json({ success: false, message: 'VPS server not found' });
      }

      let validatedData;
      if (existingServer.os === 'LINUX') {
        validatedData = updateLinuxVpsSchema.parse(data);
      } else {
        validatedData = updateWindowsVpsSchema.parse(data);
      }

      const updatedServer = await prisma.vpsServer.update({
        where: { id: parseInt(id) },
        data: validatedData
      });

      res.json({ success: true, message: 'VPS server updated successfully', vpsServer: updatedServer });
    } catch (error: any) {
      console.error('Update VPS server error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Error updating VPS server' });
    }
  },

  // Delete VPS server
  async deleteVpsServer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.vpsServer.delete({
        where: { id: parseInt(id) }
      });

      res.json({ success: true, message: 'VPS server deleted successfully' });
    } catch (error) {
      console.error('Delete VPS server error:', error);
      res.status(500).json({ success: false, message: 'Error deleting VPS server' });
    }
  }
};