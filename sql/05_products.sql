-- What sells? Units and revenue by product category, from purchase events only.
-- A per-product funnel (views → carts → sales) isn't possible in this public sample: Google
-- obfuscated product IDs differently on each event type, and a single "view_item" event lists
-- about five products. 09_data_quality.sql counts both.
WITH sold AS (
  SELECT IFNULL(NULLIF(i.item_category, ''), '(not set)') AS category,
         IFNULL(i.quantity, 1) AS units, IFNULL(i.item_revenue_in_usd, 0) AS revenue
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`, UNNEST(items) AS i
  WHERE event_name = 'purchase'
),
per_category AS (
  SELECT category, SUM(units) AS units, SUM(revenue) AS revenue FROM sold GROUP BY category
)
SELECT IF(units >= 300, category, 'Everything else') AS category,
       SUM(units) AS units, ROUND(SUM(revenue), 2) AS revenue,
       ROUND(SUM(revenue) / SUM(SUM(revenue)) OVER (), 4) AS share_of_revenue
FROM per_category
GROUP BY 1
ORDER BY category = 'Everything else', revenue DESC;
