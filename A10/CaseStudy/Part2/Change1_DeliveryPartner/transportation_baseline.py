from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import db
from app.models.transportation import (
    VehicleCreate, VehicleResponse,
    DriverCreate, DriverResponse,
    RouteCreate, RouteResponse,
    ShipmentCreate, ShipmentResponse
)
from app.repositories.shipment_repositories import TransportationRepository

router = APIRouter(prefix="/transportation", tags=["Transportation & Shipments"])

def get_transport_repo():
    return TransportationRepository(db)

# ========== Vehicles ==========

@router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(vehicle: VehicleCreate, repo: TransportationRepository = Depends(get_transport_repo)):
    """Register a new vehicle"""
    try:
        return await repo.create_vehicle(vehicle)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/vehicles", response_model=List[VehicleResponse])
async def list_vehicles(limit: int = 100, skip: int = 0, repo: TransportationRepository = Depends(get_transport_repo)):
    """List all vehicles"""
    return await repo.get_all_vehicles(limit=limit, skip=skip)

# ========== Drivers ==========

@router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(driver: DriverCreate, repo: TransportationRepository = Depends(get_transport_repo)):
    """Register a new driver"""
    try:
        return await repo.create_driver(driver)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/drivers", response_model=List[DriverResponse])
async def list_drivers(limit: int = 100, skip: int = 0, repo: TransportationRepository = Depends(get_transport_repo)):
    """List all drivers"""
    return await repo.get_all_drivers(limit=limit, skip=skip)

# ========== Routes ==========

@router.post("/routes", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(route: RouteCreate, repo: TransportationRepository = Depends(get_transport_repo)):
    """Create a new route"""
    try:
        return await repo.create_route(route)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/routes", response_model=List[RouteResponse])
async def list_routes(limit: int = 100, skip: int = 0, repo: TransportationRepository = Depends(get_transport_repo)):
    """List all routes"""
    return await repo.get_all_routes(limit=limit, skip=skip)

# ========== Shipments ==========

@router.post("/shipments", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(shipment: ShipmentCreate, repo: TransportationRepository = Depends(get_transport_repo)):
    """Create a new shipment"""
    try:
        return await repo.create_shipment(shipment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/shipments", response_model=List[ShipmentResponse])
async def list_shipments(limit: int = 100, skip: int = 0, repo: TransportationRepository = Depends(get_transport_repo)):
    """List all shipments"""
    return await repo.get_all_shipments(limit=limit, skip=skip)
