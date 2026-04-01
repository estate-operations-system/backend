import { Router } from 'express';
import VehicleParkingController from '../controllers/vehicleParkingController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: VehicleParking
 *   description: Управление транспортными средствами жителей и парковочными местами (единая таблица)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VehicleParking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         license_plate:
 *           type: string
 *         vehicle_make:
 *           type: string
 *         vehicle_model:
 *           type: string
 *         vehicle_color:
 *           type: string
 *         parking_spot:
 *           type: string
 *         parking_zone:
 *           type: string
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - user_id
 *         - license_plate
 *         - parking_spot
 *
 *     VehicleParkingCreate:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         license_plate:
 *           type: string
 *         vehicle_make:
 *           type: string
 *         vehicle_model:
 *           type: string
 *         vehicle_color:
 *           type: string
 *         parking_spot:
 *           type: string
 *         parking_zone:
 *           type: string
 *         comment:
 *           type: string
 *       required:
 *         - user_id
 *         - license_plate
 *         - parking_spot
 *
 *     VehicleParkingUpdate:
 *       type: object
 *       properties:
 *         license_plate:
 *           type: string
 *         vehicle_make:
 *           type: string
 *         vehicle_model:
 *           type: string
 *         vehicle_color:
 *           type: string
 *         parking_spot:
 *           type: string
 *         parking_zone:
 *           type: string
 *         comment:
 *           type: string
 */

/**
 * @swagger
 * /api/vehicle-parking:
 *   post:
 *     summary: Создать запись транспортного средства / парковки
 *     tags: [VehicleParking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleParkingCreate'
 *     responses:
 *       201:
 *         description: Запись создана
 *       400:
 *         description: Неверные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', VehicleParkingController.createVehicleParking);

/**
 * @swagger
 * /api/vehicle-parking:
 *   get:
 *     summary: Получить все записи по транспортным средствам и парковкам
 *     tags: [VehicleParking]
 *     responses:
 *       200:
 *         description: Список записей
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', VehicleParkingController.getAllVehicleParking);

/**
 * @swagger
 * /api/vehicle-parking/{id}:
 *   get:
 *     summary: Получить запись по ID
 *     tags: [VehicleParking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Запись найдена
 *       404:
 *         description: Запись не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', VehicleParkingController.getVehicleParkingById);

/**
 * @swagger
 * /api/vehicle-parking/user/{userId}:
 *   get:
 *     summary: Получить записи по user_id
 *     tags: [VehicleParking]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список записей пользователя
 *       500:
 *         description: Ошибка сервера
 */
router.get('/user/:userId', VehicleParkingController.getVehicleParkingByUserId);

/**
 * @swagger
 * /api/vehicle-parking/{id}:
 *   put:
 *     summary: Обновить запись транспортного средства/парковки
 *     tags: [VehicleParking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleParkingUpdate'
 *     responses:
 *       200:
 *         description: Запись обновлена
 *       404:
 *         description: Запись не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:id', VehicleParkingController.updateVehicleParking);

/**
 * @swagger
 * /api/vehicle-parking/{id}:
 *   delete:
 *     summary: Удалить запись транспортного средства/парковки
 *     tags: [VehicleParking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Запись удалена
 *       404:
 *         description: Запись не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:id', VehicleParkingController.deleteVehicleParking);

export default router;
