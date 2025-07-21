INSERT INTO requests
(collection_id, name, method, url, headers, body)
VALUES
    (1, 'Get all users', 'GET',  'https://api.example.com/users',    '{}', '{}'),
    (2, 'Create order',  'POST', 'https://api.example.com/orders',  '{"Content-Type":"application/json"}', '{"foo":"bar"}'),
    (NULL, 'Ping healthcheck', 'GET', 'https://api.example.com/health', '{}', '{}');
