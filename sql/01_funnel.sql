-- Where do shoppers drop out? Each visitor is followed through the checkout steps: they count at
-- a step if they did it and every step before it at some point in the window. Shown for everyone,
-- by device, and by season (when in the window they first came).
--
-- Window: 25 Nov 2020 to 31 Jan 2021. Before 25 Nov the store wasn't recording "add to cart"
-- reliably (none at all until 16 Nov, then on and off), so earlier weeks would undercount carts.
-- Why visitors and not single visits: the tracking logs some steps out of order (shipping info
-- often lands before "begin checkout") and many buyers add to cart in one visit and buy in a later
-- one. 09_data_quality.sql counts both.
WITH steps AS (
  SELECT
    user_pseudo_id,
    LOGICAL_OR(event_name = 'view_item')         AS viewed,
    LOGICAL_OR(event_name = 'add_to_cart')       AS carted,
    LOGICAL_OR(event_name = 'begin_checkout')    AS checked_out,
    LOGICAL_OR(event_name = 'add_shipping_info') AS shipping,
    LOGICAL_OR(event_name = 'add_payment_info')  AS payment,
    LOGICAL_OR(event_name = 'purchase')          AS purchased,
    ARRAY_AGG(device.category ORDER BY event_timestamp, event_name LIMIT 1)[OFFSET(0)] AS device,   -- device on their first visit
    IF(MIN(event_date) < '20210101', 'holiday', 'january')                AS season
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20201125' AND '20210131'      -- one table per day; this reads only the window
  GROUP BY user_pseudo_id
)
SELECT
  CASE WHEN GROUPING(device) = 0 THEN 'device' WHEN GROUPING(season) = 0 THEN 'season' ELSE 'all' END AS dimension,
  COALESCE(device, season, 'all')                                                AS segment,
  COUNT(*)                                                                       AS visitors,
  COUNTIF(viewed)                                                                AS view_item,
  COUNTIF(viewed AND carted)                                                     AS add_to_cart,
  COUNTIF(viewed AND carted AND checked_out)                                     AS begin_checkout,
  COUNTIF(viewed AND carted AND checked_out AND shipping)                        AS add_shipping_info,
  COUNTIF(viewed AND carted AND checked_out AND shipping AND payment)            AS add_payment_info,
  COUNTIF(viewed AND carted AND checked_out AND shipping AND payment AND purchased) AS purchase,
  COUNTIF(purchased)                                                             AS any_purchase   -- buyers, whatever steps were logged
FROM steps
GROUP BY GROUPING SETS ((), (device), (season))
ORDER BY dimension, segment;
