-- CHANGE 1: NEW DELIVERY PARTNER
-- Evolution from baseline WTMS schema

CREATE TABLE IF NOT EXISTS delivery_partners (
    delivery_partner_id SERIAL PRIMARY KEY,
    partner_name VARCHAR(200) NOT NULL UNIQUE,
    contact_person VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS delivery_partner_id INTEGER
REFERENCES delivery_partners(delivery_partner_id);

CREATE INDEX IF NOT EXISTS idx_shipments_delivery_partner_id
ON shipments(delivery_partner_id);
