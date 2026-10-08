-- Do holiday shoppers come back? The share of first-time visitors who returned within 14 days,
-- by when they first came, and separately for those who bought on their first day.
-- 14 days so every group can be followed in full: first visits up to 17 Jan 2021.
WITH sessions AS (
  SELECT user_pseudo_id, PARSE_DATE('%Y%m%d', event_date) AS day, event_name
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE event_name IN ('session_start', 'purchase')
),
first_seen AS (
  SELECT user_pseudo_id, MIN(day) AS first_day FROM sessions WHERE event_name = 'session_start' GROUP BY user_pseudo_id
),
per_visitor AS (
  SELECT f.user_pseudo_id, f.first_day,
         CASE WHEN f.first_day < '2020-11-25' THEN '1 Before the holidays (1–24 Nov)'
              WHEN f.first_day < '2021-01-01' THEN '2 Holiday season (25 Nov–31 Dec)'
              ELSE '3 January (1–17 Jan)' END AS season,
         LOGICAL_OR(s.event_name = 'purchase' AND s.day = f.first_day)                                   AS bought_first_day,
         LOGICAL_OR(s.event_name = 'session_start' AND s.day > f.first_day AND s.day <= f.first_day + 14) AS returned_14d
  FROM first_seen f JOIN sessions s USING (user_pseudo_id)
  WHERE f.first_day <= '2021-01-17'
  GROUP BY f.user_pseudo_id, f.first_day
)
SELECT SUBSTR(season, 3) AS season,
       IF(bought_first_day, 'bought on first day', 'did not buy on first day') AS first_day,
       COUNT(*) AS visitors, COUNTIF(returned_14d) AS returned, ROUND(COUNTIF(returned_14d) / COUNT(*), 5) AS return_rate
FROM per_visitor
GROUP BY season, first_day
ORDER BY season, first_day;
