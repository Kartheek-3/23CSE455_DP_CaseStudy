-- CHANGE 3: SHIPMENT ROUTE CHANGES
-- Evolution from baseline WTMS schema

CREATE TABLE IF NOT EXISTS shipment_route_history (
    route_history_id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL
        REFERENCES shipments(shipment_id)
        ON DELETE CASCADE,
    previous_route_id INTEGER
        REFERENCES routes(route_id),
    new_route_id INTEGER NOT NULL
        REFERENCES routes(route_id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipment_route_history_shipment_id
ON shipment_route_history(shipment_id);

CREATE INDEX IF NOT EXISTS idx_shipment_route_history_changed_at
ON shipment_route_history(changed_at);
