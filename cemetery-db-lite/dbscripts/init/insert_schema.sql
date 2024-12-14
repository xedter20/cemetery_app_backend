INSERT INTO COM_D_APP.CMN_DM_USR (
    ID, ROLE, ACCOUNT_TYPE, FIRST_NAME, LAST_NAME, PASSWORD, EMAIL, GENDER, DEVICE, LOCATION, STATUS, REASON, ADDED_BY, ADDED_DATE, MODIFIED_BY, MODIFIED_DATE
) VALUES (
    1, 
    'admin', 
    'admin', 
    'Admin', 
    'User', 
    '$2b$10$zWEv5z7/eCnXowrZY3Gt6OpYuzSFP2Ppm68glqv.VpDJJBGVsqwjS',  -- Hashed password 'Password123'
    'admin@guimaras-cemetery.com', 
    'M', 
    NULL, 
    NULL, 
    1, 
    NULL, 
    'system', 
    CURRENT_TIMESTAMP, 
    'system', 
    CURRENT_TIMESTAMP
);

INSERT INTO COM_D_APP.PERMISSIONS (
    ID,
    EMAIL,
    ROLE,
    ACCOUNT_TYPE,
    CAN_VIEW_LOCAL_ECONOMIC_ENTERPRISE,
    CAN_VIEW_MUNICIPAL_TREASURER,
    CAN_VIEW_GUEST,
    CAN_VIEW_TOTAL_PAYMENT,
    CAN_VIEW_USER_MANAGEMENT,
    CAN_VIEW_PROFILING,
    CAN_VIEW_MAPPING,
    CAN_VIEW_NOTIFICATIONS,
    CAN_VIEW_REPORTS,
    CAN_VIEW_LOGS,
    CAN_VIEW_SEARCH_MAP,
    ACTION_LOCAL_ECONOMIC_ENTERPRISE,
    ACTION_MUNICIPAL_TREASURER,
    ACTION_GUEST,
    ACTION_TOTAL_PAYMENT,
    ACTION_USER_MANAGEMENT,
    ACTION_PROFILING,
    ACTION_MAPPING,
    ACTION_NOTIFICATIONS,
    ACTION_REPORTS,
    ACTION_LOGS,
    ACTION_SEARCH_MAP,
    STATUS,
    ADDED_BY,
    ADDED_DATE,
    MODIFIED_BY,
    MODIFIED_DATE
) VALUES (
    'UUID-GOES-HERE',  -- Replace with the actual UUID or use a UUID generator in your DBMS
    'admin@guimaras-cemetery.com',
    'role_admin',
    'admin',
    1, -- CAN_VIEW_LOCAL_ECONOMIC_ENTERPRISE
    1, -- CAN_VIEW_MUNICIPAL_TREASURER
    1, -- CAN_VIEW_GUEST
    1, -- CAN_VIEW_TOTAL_PAYMENT
    1, -- CAN_VIEW_USER_MANAGEMENT
    1, -- CAN_VIEW_PROFILING
    1, -- CAN_VIEW_MAPPING
    1, -- CAN_VIEW_NOTIFICATIONS
    1, -- CAN_VIEW_REPORTS
    1, -- CAN_VIEW_LOGS
    1, -- CAN_VIEW_SEARCH_MAP
    'view|create|update|delete', -- ACTION_LOCAL_ECONOMIC_ENTERPRISE
    'view|create|update|delete', -- ACTION_MUNICIPAL_TREASURER
    'view|create|update|delete', -- ACTION_GUEST
    'view|create|update|delete', -- ACTION_TOTAL_PAYMENT
    'view|create|update|delete', -- ACTION_USER_MANAGEMENT
    'view|create|update|delete', -- ACTION_PROFILING
    'view|create|update|delete', -- ACTION_MAPPING
    'view|create|update|delete', -- ACTION_NOTIFICATIONS
    'view|create|update|delete', -- ACTION_REPORTS
    'view|create|update|delete', -- ACTION_LOGS
    'view|create|update|delete', -- ACTION_SEARCH_MAP
    1,  -- Status (active)
    'SYSTEM',  -- Added by
    CURRENT_TIMESTAMP,  -- Added date
    'SYSTEM',  -- Modified by
    CURRENT_TIMESTAMP   -- Modified date
);




-- TEST
SELECT * FROM CMN_DM_USR    --  SELECT * FROM CMN_TX_DECEASED            ---  SELECT * FROM ACTIVITY_LOGS     --  SELECT * FROM CMN_TX_PAYMENT

SELECT * FROM ACTIVITY_LOGS     ---  SELECT * FROM PERMISSIONS

-- DELETE FROM  CMN_DM_USR WHERE ACCOUNT_TYPE in ('treasurer','enterprise','guest');  ----   DELETE FROM  CMN_DM_USR WHERE ACCOUNT_TYPE in ('admin');

-- DELETE FROM  CMN_TX_DECEASED         ----- DELETE FROM PERMISSIONS WHERE ACCOUNT_TYPE in ('admin');



-- TEST CORS
-- curl -H "Origin: http://localhost:3000" -H "Content-Type: application/json" -X POST -v http://localhost:3002/admin/login -d "{\"email\": \"admin@guimaras-cemetery.com\", \"password\": \"Password12345678\"}"






