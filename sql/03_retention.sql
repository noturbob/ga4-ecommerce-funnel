-- Do visitors come back? Weekly cohorts by first visit: of the people who first came in a given
-- week, the share who visited again 1, 2, 3 ... weeks later. A cohort is only shown for weeks the
-- data actually covers (it ends on 31 Jan 2021).
WITH visits AS (
  SELECT DISTINCT user_pseudo_id, DATE_TRUNC(PARSE_DATE('%Y%m%d', event_date), WEEK(MONDAY)) AS week
  FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
  WHERE event_name = 'session_start'
),
cohorts AS (
  SELECT user_pseudo_id, MIN(week) AS cohort_week FROM visits GROUP BY user_pseudo_id
),
activity AS (
  SELECT c.cohort_week, DATE_DIFF(v.week, c.cohort_week, WEEK) AS weeks_later, COUNT(DISTINCT v.user_pseudo_id) AS active
  FROM cohorts c JOIN visits v USING (user_pseudo_id)
  GROUP BY c.cohort_week, weeks_later
),
sizes AS (
  SELECT cohort_week, COUNT(*) AS cohort_size FROM cohorts GROUP BY cohort_week
)
SELECT FORMAT_DATE('%Y-%m-%d', a.cohort_week) AS cohort_week, s.cohort_size, a.weeks_later, a.active,
       ROUND(a.active / s.cohort_size, 5) AS share
FROM activity a JOIN sizes s USING (cohort_week)
WHERE a.cohort_week >= '2020-11-02'                     -- the first full week (data starts on a Sunday)
  AND DATE_ADD(a.cohort_week, INTERVAL a.weeks_later WEEK) <= '2021-01-25'   -- last full week
ORDER BY a.cohort_week, a.weeks_later;
