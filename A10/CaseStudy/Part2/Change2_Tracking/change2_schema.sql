-- CHANGE 2: REAL-TIME SHIPMENT TRACKING
-- Evolution from baseline WTMS schema

CREATE TABLE IF NOT EXISTS shipment_tracking (
    tracking_id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL
        REFERENCES shipments(shipment_id)
        ON DELETE CASCADE,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    location VARCHAR(200),
    status VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment_id
ON shipment_tracking(shipment_id);

CREATE INDEX IF NOT EXISTS idx_shipment_tracking_recorded_at
ON shipment_tracking(recorded_at);
