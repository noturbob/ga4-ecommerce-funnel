-- How far can this data be trusted? Counts of the tracking quirks the other queries work around.
WITH events AS (
  SELECT user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
         event_name, event_timestamp, event_date, ecommerce.transaction_id
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE event_name IN ('add_to_cart', 'begin_checkout', 'add_shipping_info', 'purchase')
),
visits AS (
  SELECT user_pseudo_id, session_id,
         MIN(IF(event_name = 'add_to_cart', event_timestamp, NULL))       AS t_cart,
         MIN(IF(event_name = 'begin_checkout', event_timestamp, NULL))    AS t_checkout,
         MIN(IF(event_name = 'add_shipping_info', event_timestamp, NULL)) AS t_shipping,
         MIN(IF(event_name = 'purchase', event_timestamp, NULL))          AS t_purchase
  FROM events GROUP BY user_pseudo_id, session_id
),
item_ids AS (
  SELECT event_name, i.item_id
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`, UNNEST(items) AS i
  WHERE event_name IN ('view_item', 'purchase') AND i.item_id != '(not set)'
),
sources AS (
  SELECT user_pseudo_id, COUNT(DISTINCT traffic_source.medium) AS n
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  GROUP BY user_pseudo_id
),
daily_carts AS (
  SELECT event_date, COUNTIF(event_name = 'add_to_cart') AS carts FROM events GROUP BY event_date
)
SELECT 'Days with no add-to-cart events at all'                     AS issue, (SELECT COUNTIF(carts = 0) FROM daily_carts) AS count, 'Cart tracking was off until 16 Nov 2020 and on and off until 25 Nov; cart analysis starts 25 Nov.' AS handling
UNION ALL SELECT 'Visits where shipping info is logged before checkout starts', (SELECT COUNTIF(t_shipping < t_checkout) FROM visits), 'The two fire together, so they are treated as one step.'
UNION ALL SELECT 'Visits with a purchase but no add-to-cart in that visit',   (SELECT COUNTIF(t_purchase IS NOT NULL AND t_cart IS NULL) FROM visits), 'Buyers often add to cart in an earlier visit, so funnels follow visitors, not single visits.'
UNION ALL SELECT 'Purchase events without an order ID',                       (SELECT COUNTIF(event_name = 'purchase' AND transaction_id = '(not set)') FROM events), 'Left out of order counts and revenue; still counted as buyers.'
UNION ALL SELECT 'Purchase events that repeat an order already counted',      (SELECT COUNTIF(event_name = 'purchase' AND transaction_id != '(not set)') - COUNT(DISTINCT IF(event_name = 'purchase' AND transaction_id != '(not set)', transaction_id, NULL)) FROM events), 'Each order is counted once.'
UNION ALL SELECT 'Purchased product IDs that also appear on a product view',
          (SELECT COUNT(DISTINCT item_id) FROM item_ids WHERE event_name = 'purchase'
             AND item_id IN (SELECT item_id FROM item_ids WHERE event_name = 'view_item')),
          'IDs were obfuscated per event type, so products cannot be followed from view to sale; product analysis uses purchases only.'
UNION ALL SELECT 'Visitors with more than one "first" traffic source',
          (SELECT COUNTIF(n > 1) FROM sources),
          'A first-touch source should never change; channel results use each visitor’s first event and are read as rough.'
ORDER BY count DESC;
