export interface VehicleParking {
  id?: number;
  user_id: number;
  license_plate: string;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  parking_spot: string;
  parking_zone?: string | null;
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
