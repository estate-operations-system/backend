import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('VehicleParkingController', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 when createVehicleParking misses required fields', async () => {
    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { body: { user_id: null, license_plate: '', parking_spot: null } };
    const res = mockResponse();

    await VehicleParkingController.createVehicleParking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates vehicle parking record successfully', async () => {
    const newRecord = { id: 1, user_id: 5, license_plate: 'ABC123', parking_spot: 'P1' };
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { create: jest.fn<any>().mockResolvedValue(newRecord) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = {
      body: { user_id: 5, license_plate: 'ABC123', parking_spot: 'P1', vehicle_make: 'Toy', vehicle_model: 'Corolla' },
    };
    const res = mockResponse();

    await VehicleParkingController.createVehicleParking(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Запись создана', data: newRecord });
  });

  it('returns all vehicle parking rows', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findAll: jest.fn<any>().mockResolvedValue(items) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = {};
    const res = mockResponse();

    await VehicleParkingController.getAllVehicleParking(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, count: items.length, data: items });
  });

  it('returns 404 for missing getVehicleParkingById', async () => {
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(null) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { id: '99' } };
    const res = mockResponse();

    await VehicleParkingController.getVehicleParkingById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns user vehicle parking rows by userId', async () => {
    const rows = [{ id: 10, user_id: 3 }];
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findByUserId: jest.fn<any>().mockResolvedValue(rows) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { userId: '3' } };
    const res = mockResponse();

    await VehicleParkingController.getVehicleParkingByUserId(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, count: rows.length, data: rows });
  });

  it('returns 404 when updateVehicleParking misses existing record', async () => {
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(null) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { id: '5' }, body: { license_plate: 'ABC123', parking_spot: 'P2' } };
    const res = mockResponse();

    await VehicleParkingController.updateVehicleParking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when updateVehicleParking has invalid license_plate or parking_spot', async () => {
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue({ id: 5, license_plate: 'OLD', parking_spot: 'OLD', vehicle_make: null, vehicle_model: null, vehicle_color: null, parking_zone: null, comment: null }) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { id: '5' }, body: { license_plate: '', parking_spot: '' } };
    const res = mockResponse();

    await VehicleParkingController.updateVehicleParking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates existing vehicle parking record', async () => {
    const existing = { id: 5, license_plate: 'OLD', parking_spot: 'OLD', vehicle_make: 'X', vehicle_model: 'Y', vehicle_color: 'red', parking_zone: 'Z', comment: 'old' };
    const updated = { ...existing, license_plate: 'NEW', parking_spot: 'P1' };
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(existing), update: jest.fn<any>().mockResolvedValue(updated) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { id: '5' }, body: { license_plate: 'NEW', parking_spot: 'P1' } };
    const res = mockResponse();

    await VehicleParkingController.updateVehicleParking(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Запись обновлена', data: updated });
  });

  it('deletes vehicle parking record successfully', async () => {
    const existing = { id: 5, license_plate: 'OLD', parking_spot: 'OLD' };
    jest.doMock('../models/vehicleParkingModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(existing), delete: jest.fn<any>().mockResolvedValue(existing) },
    }));

    const { default: VehicleParkingController } = require('../controllers/vehicleParkingController');
    const req: any = { params: { id: '5' } };
    const res = mockResponse();

    await VehicleParkingController.deleteVehicleParking(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Запись удалена', data: existing });
  });
});
