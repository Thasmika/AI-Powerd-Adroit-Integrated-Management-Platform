INSERT INTO locations (id, name, is_active) VALUES (1, 'Head Office', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, name, is_active) VALUES (2, 'Jebel Ali', true) ON CONFLICT (id) DO NOTHING;
