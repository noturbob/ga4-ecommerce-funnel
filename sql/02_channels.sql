-- Which traffic brings buyers, and which brings only browsers? Visitors grouped by how they first
-- found the store (GA4's first-touch traffic source) and by device. All three months: visits and
-- purchases were tracked throughout.
-- '<Other>' and '(data deleted)' are sources Google obfuscated in this public sample.
WITH visitors AS (
  SELECT
    user_pseudo_id,
    -- first touch, read from the visitor's first event: in this obfuscated sample a few visitors carry
    -- more than one value, so "any value" would change from run to run
    ARRAY_AGG(traffic_source.medium ORDER BY event_timestamp, event_name LIMIT 1)[OFFSET(0)] AS medium,
    ARRAY_AGG(device.category ORDER BY event_timestamp, event_name LIMIT 1)[OFFSET(0)]       AS device
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  GROUP BY user_pseudo_id
),
orders AS (                          -- one row per real order, with who placed it
  SELECT user_pseudo_id, ecommerce.transaction_id, MAX(ecommerce.purchase_revenue_in_usd) AS revenue
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE event_name = 'purchase' AND ecommerce.transaction_id != '(not set)'
  GROUP BY user_pseudo_id, ecommerce.transaction_id
),
per_visitor AS (
  SELECT v.*,
         CASE v.medium WHEN 'organic' THEN 'Organic search' WHEN '(none)' THEN 'Direct' WHEN 'referral' THEN 'Referral'
                       WHEN 'cpc' THEN 'Paid search' ELSE 'Unknown (hidden in the sample)' END AS channel,
         COUNT(o.transaction_id) AS orders, IFNULL(SUM(o.revenue), 0) AS revenue
  FROM visitors v LEFT JOIN orders o USING (user_pseudo_id)
  GROUP BY v.user_pseudo_id, v.medium, v.device
)
SELECT
  IF(GROUPING(channel) = 0, 'channel', 'device')       AS dimension,
  COALESCE(channel, device)                            AS segment,
  COUNT(*)                                             AS visitors,
  COUNTIF(orders > 0)                                  AS buyers,
  ROUND(COUNTIF(orders > 0) / COUNT(*), 5)             AS conversion,
  SUM(orders)                                          AS orders,
  ROUND(SUM(revenue), 2)                               AS revenue,
  ROUND(SUM(revenue) / COUNT(*), 3)                    AS revenue_per_visitor,
  ROUND(SAFE_DIVIDE(SUM(revenue), SUM(orders)), 2)     AS avg_order_value
FROM per_visitor
GROUP BY GROUPING SETS ((channel), (device))
ORDER BY dimension, visitors DESC;
