SELECT
  row_number() OVER () AS id,
  study_id,
  scenario_id,
  scenario_subtype_id,
  field_name
FROM
  (
    SELECT
      mm.study_id,
      mm.scenario_id,
      mm.scenario_subtype_id,
      mm.field_name
    FROM
      metrics_metadata mm
    WHERE
      (mm.map_display = TRUE)
    ORDER BY
      mm.study_id,
      mm.scenario_id,
      mm.field_name
  ) query;