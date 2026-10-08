-- The store at a glance, by month and in total: visitors, visits, purchases and revenue.
-- A purchase is counted once per order (transaction_id); some purchase events repeat the same order.
-- 883 purchase events carry no order ID ('(not set)'), so they're reported separately.
WITH events AS (
  SELECT
    FORMAT_DATE('%Y-%m', PARSE_DATE('%Y%m%d', event_date)) AS m,
    user_pseudo_id,
    event_name,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    ecommerce.transaction_id,
    ecommerce.purchase_revenue_in_usd AS revenue
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
),
orders AS (                        -- one row per real order
  SELECT m, transaction_id, MAX(revenue) AS revenue
  FROM events
  WHERE event_name = 'purchase' AND transaction_id != '(not set)'
  GROUP BY m, transaction_id
),
traffic AS (
  SELECT IFNULL(m, 'all') AS month,
         COUNT(*)                                                         AS events,
         COUNT(DISTINCT user_pseudo_id)                                   AS users,
         COUNT(DISTINCT CONCAT(user_pseudo_id, CAST(session_id AS STRING))) AS sessions,
         COUNTIF(event_name = 'purchase')                                 AS purchase_events,
         COUNTIF(event_name = 'purchase' AND transaction_id = '(not set)') AS purchases_without_id
  FROM events
  GROUP BY ROLLUP(m)
),
sales AS (
  SELECT IFNULL(m, 'all') AS month, COUNT(*) AS orders, SUM(revenue) AS revenue, AVG(revenue) AS avg_order_value
  FROM orders
  GROUP BY ROLLUP(m)
)
SELECT t.*, s.orders, ROUND(s.revenue, 2) AS revenue, ROUND(s.avg_order_value, 2) AS avg_order_value
FROM traffic t JOIN sales s USING (month)
ORDER BY month = 'all', month;
