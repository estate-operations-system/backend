import pool from '../config/database';
import { VehicleParking } from '../types/VehicleParking';

class VehicleParkingModel {
  static async create(data: VehicleParking): Promise<VehicleParking> {
    const {
      user_id,
      license_plate,
      vehicle_make,
      vehicle_model,
      vehicle_color,
      parking_spot,
      parking_zone,
      comment,
    } = data;

    const result = await pool.query(
      `INSERT INTO vehicle_parking (user_id, license_plate, vehicle_make, vehicle_model, vehicle_color, parking_spot, parking_zone, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user_id,
        license_plate,
        vehicle_make ?? null,
        vehicle_model ?? null,
        vehicle_color ?? null,
        parking_spot,
        parking_zone ?? null,
        comment ?? null,
      ]
    );

    return result.rows[0];
  }

  static async findAll(): Promise<VehicleParking[]> {
    const result = await pool.query('SELECT * FROM vehicle_parking ORDER BY id');
    return result.rows;
  }

  static async findById(id: number): Promise<VehicleParking | null> {
    const result = await pool.query('SELECT * FROM vehicle_parking WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(user_id: number): Promise<VehicleParking[]> {
    const result = await pool.query(
      'SELECT * FROM vehicle_parking WHERE user_id = $1 ORDER BY id',
      [user_id]
    );
    return result.rows;
  }

  static async update(id: number, data: VehicleParking): Promise<VehicleParking | null> {
    const {
      license_plate,
      vehicle_make,
      vehicle_model,
      vehicle_color,
      parking_spot,
      parking_zone,
      comment,
    } = data;

    const result = await pool.query(
      `UPDATE vehicle_parking
       SET license_plate = $1,
           vehicle_make = $2,
           vehicle_model = $3,
           vehicle_color = $4,
           parking_spot = $5,
           parking_zone = $6,
           comment = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        license_plate,
        vehicle_make ?? null,
        vehicle_model ?? null,
        vehicle_color ?? null,
        parking_spot,
        parking_zone ?? null,
        comment ?? null,
        id,
      ]
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<{ id: number } | null> {
    const result = await pool.query('DELETE FROM vehicle_parking WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }
}

export default VehicleParkingModel;
