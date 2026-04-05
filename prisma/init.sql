-- 初始化產品數據
INSERT INTO products (id, name, duration, price, card_type, is_active, created_at) VALUES
  ('prod_1d', '1天體驗', 1, 10.00, '1d', true, NOW()),
  ('prod_7d', '7天套餐', 7, 50.00, '7d', true, NOW()),
  ('prod_30d', '30天套餐', 30, 150.00, '30d', true, NOW()),
  ('prod_365d', '365天年卡', 365, 999.00, '365d', true, NOW());
