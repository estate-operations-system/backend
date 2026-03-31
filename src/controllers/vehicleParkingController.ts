import { Request, Response } from 'express';
import VehicleParkingModel from '../models/vehicleParkingModel';

class VehicleParkingController {
  static async createVehicleParking(req: Request, res: Response) {
    try {
      const { user_id, license_plate, vehicle_make, vehicle_model, vehicle_color, parking_spot, parking_zone, comment } = req.body;

      if (!user_id || !license_plate || !parking_spot) {
        return res.status(400).json({ success: false, error: 'user_id, license_plate и parking_spot обязательны' });
      }

      const newRecord = await VehicleParkingModel.create({
        user_id: Number(user_id),
        license_plate,
        vehicle_make: vehicle_make ?? null,
        vehicle_model: vehicle_model ?? null,
        vehicle_color: vehicle_color ?? null,
        parking_spot,
        parking_zone: parking_zone ?? null,
        comment: comment ?? null,
      });

      return res.status(201).json({ success: true, message: 'Запись создана', data: newRecord });
    } catch (error) {
      console.error('Ошибка при создании записи vehicle_parking:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при создании записи vehicle_parking' });
    }
  }

  static async getAllVehicleParking(req: Request, res: Response) {
    try {
      const items = await VehicleParkingModel.findAll();
      return res.json({ success: true, count: items.length, data: items });
    } catch (error) {
      console.error('Ошибка при получении vehicle_parking:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при получении vehicle_parking' });
    }
  }

  static async getVehicleParkingById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const item = await VehicleParkingModel.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Запись не найдена' });
      }
      return res.json({ success: true, data: item });
    } catch (error) {
      console.error('Ошибка при получении записи vehicle_parking по id:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при получении записи vehicle_parking по id' });
    }
  }

  static async getVehicleParkingByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const items = await VehicleParkingModel.findByUserId(userId);
      return res.json({ success: true, count: items.length, data: items });
    } catch (error) {
      console.error('Ошибка при получении vehicle_parking по user_id:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при получении vehicle_parking по user_id' });
    }
  }

  static async updateVehicleParking(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await VehicleParkingModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Запись не найдена' });
      }

      const { license_plate, vehicle_make, vehicle_model, vehicle_color, parking_spot, parking_zone, comment } = req.body;

      if (!license_plate || !parking_spot) {
        return res.status(400).json({ success: false, error: 'license_plate и parking_spot обязательны' });
      }

      const updated = await VehicleParkingModel.update(id, {
        ...existing,
        license_plate,
        vehicle_make: vehicle_make ?? existing.vehicle_make,
        vehicle_model: vehicle_model ?? existing.vehicle_model,
        vehicle_color: vehicle_color ?? existing.vehicle_color,
        parking_spot,
        parking_zone: parking_zone ?? existing.parking_zone,
        comment: comment ?? existing.comment,
      });

      return res.json({ success: true, message: 'Запись обновлена', data: updated });
    } catch (error) {
      console.error('Ошибка при обновлении vehicle_parking:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при обновлении vehicle_parking' });
    }
  }

  static async deleteVehicleParking(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await VehicleParkingModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Запись не найдена' });
      }

      const deleted = await VehicleParkingModel.delete(id);
      return res.json({ success: true, message: 'Запись удалена', data: deleted });
    } catch (error) {
      console.error('Ошибка при удалении vehicle_parking:', error);
      return res.status(500).json({ success: false, error: 'Ошибка сервера при удалении vehicle_parking' });
    }
  }
}

export default VehicleParkingController;
