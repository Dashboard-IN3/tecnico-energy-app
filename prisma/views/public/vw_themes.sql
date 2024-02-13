SELECT
  row_number() OVER () AS id,
  study_id,
  theme_name,
  subtypes,
  scenarios
FROM
  (
    SELECT
      metrics_metadata.study_id,
      metrics_metadata.theme_name,
      array_agg(DISTINCT metrics_metadata.theme_subtype) AS subtypes,
      array_agg(DISTINCT metrics_metadata.scenario_name) AS scenarios
    FROM
      metrics_metadata
    WHERE
      (
        (metrics_metadata.theme_subtype IS NOT NULL)
        AND (metrics_metadata.scenario_name <> '' :: text)
      )
    GROUP BY
      metrics_metadata.study_id,
      metrics_metadata.theme_name
    ORDER BY
      metrics_metadata.study_id,
      metrics_metadata.theme_name
  ) query;