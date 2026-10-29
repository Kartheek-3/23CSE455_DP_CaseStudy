from typing import List, Optional
from app.database import Database
from app.models.transportation import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    DriverCreate, DriverUpdate, DriverResponse,
    RouteCreate, RouteUpdate, RouteResponse,
    ShipmentCreate, ShipmentUpdate, ShipmentResponse
)
import logging

logger = logging.getLogger(__name__)

class TransportationRepository:
    """Repository for transportation-related operations"""
    
    def __init__(self, db: Database):
        self.db = db

    # ========== Vehicle CRUD ==========
    async def create_vehicle(self, vehicle: VehicleCreate) -> VehicleResponse:
        query = """
            INSERT INTO vehicles (
                vehicle_number, vehicle_type, capacity_kg, capacity_cubic_meters, last_maintenance_date, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING vehicle_id, vehicle_number, vehicle_type, capacity_kg, capacity_cubic_meters, last_maintenance_date, is_active, created_at, updated_at
        """
        row = await self.db.fetch_one(
            query,
            vehicle.vehicle_number, vehicle.vehicle_type, vehicle.capacity_kg, 
            vehicle.capacity_cubic_meters, vehicle.last_maintenance_date, vehicle.is_active
        )
        return VehicleResponse(**dict(row))

    async def get_all_vehicles(self, limit: int = 100, skip: int = 0) -> List[VehicleResponse]:
        query = """
            SELECT vehicle_id, vehicle_number, vehicle_type, capacity_kg, capacity_cubic_meters, last_maintenance_date, is_active, created_at, updated_at
            FROM vehicles ORDER BY vehicle_id LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [VehicleResponse(**dict(row)) for row in rows]

    # ========== Driver CRUD ==========
    async def create_driver(self, driver: DriverCreate) -> DriverResponse:
        query = """
            INSERT INTO drivers (
                driver_name, license_number, phone, email, hired_date, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING driver_id, driver_name, license_number, phone, email, hired_date, is_active, created_at, updated_at
        """
        row = await self.db.fetch_one(
            query,
            driver.driver_name, driver.license_number, driver.phone, driver.email, driver.hired_date, driver.is_active
        )
        return DriverResponse(**dict(row))

    async def get_all_drivers(self, limit: int = 100, skip: int = 0) -> List[DriverResponse]:
        query = """
            SELECT driver_id, driver_name, license_number, phone, email, hired_date, is_active, created_at, updated_at
            FROM drivers ORDER BY driver_id LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [DriverResponse(**dict(row)) for row in rows]

    # ========== Route CRUD ==========
    async def create_route(self, route: RouteCreate) -> RouteResponse:
        query = """
            INSERT INTO routes (
                origin_city, destination_city, distance_km, estimated_hours
            ) VALUES ($1, $2, $3, $4)
            RETURNING route_id, origin_city, destination_city, distance_km, estimated_hours, created_at
        """
        row = await self.db.fetch_one(query, route.origin_city, route.destination_city, route.distance_km, route.estimated_hours)
        return RouteResponse(**dict(row))

    async def get_all_routes(self, limit: int = 100, skip: int = 0) -> List[RouteResponse]:
        query = """
            SELECT route_id, origin_city, destination_city, distance_km, estimated_hours, created_at
            FROM routes ORDER BY route_id LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [RouteResponse(**dict(row)) for row in rows]

    # ========== Shipment CRUD ==========
    async def create_shipment(self, shipment: ShipmentCreate) -> ShipmentResponse:
        import time
        shipment_number = f"SHP-{int(time.time())}"
        
        query = """
            INSERT INTO shipments (
                order_id, vehicle_id, driver_id, route_id, shipment_number, status, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING shipment_id, order_id, vehicle_id, driver_id, route_id, shipment_number, status, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes, created_at, updated_at
        """
        row = await self.db.fetch_one(
            query,
            shipment.order_id, shipment.vehicle_id, shipment.driver_id, shipment.route_id,
            shipment_number, shipment.status, shipment.scheduled_departure, shipment.scheduled_arrival,
            shipment.actual_departure, shipment.actual_arrival, shipment.notes
        )
        return ShipmentResponse(**dict(row))

    async def get_all_shipments(self, limit: int = 100, skip: int = 0) -> List[ShipmentResponse]:
        query = """
            SELECT shipment_id, order_id, vehicle_id, driver_id, route_id, shipment_number, status, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes, created_at, updated_at
            FROM shipments ORDER BY shipment_id DESC LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [ShipmentResponse(**dict(row)) for row in rows]
