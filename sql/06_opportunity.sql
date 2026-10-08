-- What should the store fix first, and what is it worth? For each step of the funnel: how many
-- visitors leave there, and the extra revenue if the store won back 1 in 10 of them, assuming they
-- then behave like the visitors who did carry on (same chance of buying, same order value).
-- Window: 25 Nov 2020 to 31 Jan 2021, as in 01_funnel.sql. An estimate of scale, not a forecast.
WITH steps AS (
  SELECT user_pseudo_id,
    LOGICAL_OR(event_name = 'view_item')        AS viewed,
    LOGICAL_OR(event_name = 'add_to_cart')      AS carted,
    LOGICAL_OR(event_name = 'begin_checkout')   AS checked_out,
    LOGICAL_OR(event_name = 'add_payment_info') AS payment,     -- shipping info is logged with checkout, so it's merged into it
    LOGICAL_OR(event_name = 'purchase')         AS purchased
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20201125' AND '20210131'
  GROUP BY user_pseudo_id
),
funnel AS (
  SELECT 1 AS step, 'Browsing → viewing a product' AS leak, COUNT(*) AS reached, COUNTIF(viewed) AS passed FROM steps
  UNION ALL SELECT 2, 'Viewing → adding to cart',       COUNTIF(viewed), COUNTIF(viewed AND carted) FROM steps
  UNION ALL SELECT 3, 'Cart → starting checkout',       COUNTIF(viewed AND carted), COUNTIF(viewed AND carted AND checked_out) FROM steps
  UNION ALL SELECT 4, 'Shipping → entering payment',    COUNTIF(viewed AND carted AND checked_out), COUNTIF(viewed AND carted AND checked_out AND payment) FROM steps
  UNION ALL SELECT 5, 'Payment → completing the order', COUNTIF(viewed AND carted AND checked_out AND payment),
                      COUNTIF(viewed AND carted AND checked_out AND payment AND purchased) FROM steps
),
buyers AS (
  SELECT COUNTIF(viewed AND carted AND checked_out AND payment AND purchased) AS n FROM steps
),
aov AS (                               -- average order value in the window, one row per real order
  SELECT AVG(revenue) AS value FROM (
    SELECT ecommerce.transaction_id, MAX(ecommerce.purchase_revenue_in_usd) AS revenue
    FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
    WHERE _TABLE_SUFFIX BETWEEN '20201125' AND '20210131'
      AND event_name = 'purchase' AND ecommerce.transaction_id != '(not set)'
    GROUP BY 1)
)
SELECT f.step, f.leak, f.reached, f.passed, f.reached - f.passed AS lost,
       ROUND(f.passed / f.reached, 4)                                        AS pass_rate,
       ROUND(b.n / f.passed, 4)                                              AS buy_rate_after,     -- of those who passed, share who bought
       ROUND(0.1 * (f.reached - f.passed) * b.n / f.passed, 1)               AS extra_buyers,
       ROUND(0.1 * (f.reached - f.passed) * b.n / f.passed * a.value, 0)     AS extra_revenue,
       ROUND(a.value, 2)                                                     AS avg_order_value
FROM funnel f, buyers b, aov a
ORDER BY f.step;
