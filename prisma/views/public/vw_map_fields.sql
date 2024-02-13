SELECT
  row_number() OVER () AS id,
  study_id,
  theme_name,
  theme_subtype,
  scenario_name,
  field_name
FROM
  (
    SELECT
      metrics_metadata.study_id,
      metrics_metadata.theme_name,
      metrics_metadata.theme_subtype,
      metrics_metadata.scenario_name,
      metrics_metadata.field_name
    FROM
      metrics_metadata
    WHERE
      (metrics_metadata.map_display = TRUE)
    ORDER BY
      metrics_metadata.study_id,
      metrics_metadata.theme_name,
      metrics_metadata.scenario_name,
      metrics_metadata.theme_subtype,
      metrics_metadata.field_name
  ) query;