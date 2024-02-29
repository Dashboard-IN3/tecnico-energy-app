-- For a given study & theme, get all the fields relevant to render each scenario
CREATE OR REPLACE FUNCTION get_metrics_metadata_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT '')
  RETURNS SETOF metrics_metadata
  AS $$
  -- Find scenario sluugs applicable to the study & theme. We also want to include NULL scenario
  WITH relevant_scenarios AS(
    SELECT DISTINCT
      scenario_slug AS slug
    FROM
      metrics_metadata
    WHERE
      study_slug = study_slug_arg
      AND theme_slug = theme_slug_arg
      AND CASE 
        WHEN scenario_slug_arg = '' THEN
          TRUE
        WHEN scenario_slug_arg IS NULL THEN
          scenario_slug IS NULL
        ELSE
          scenario_slug = scenario_slug_arg
        END
  ),
  -- Rank every field by scenario, category, usage, source. Ranking gives us a preference of use
  -- for each field, ie if a scenario provides an override field, that is first preferred and the
  -- default NULL scenario field second
  ranked_metrics_metadata AS(
    SELECT
      s.slug,
      m.field_name,
      m.description,
      m.units,
      m.study_slug,
      m.theme_slug,
      m.category,
      m.usage,
      m.source,
      rank() OVER(PARTITION BY s.slug,
        m.category,
        m.usage,
        m.source ORDER BY m.scenario_slug DESC NULLS LAST) AS pos
    FROM
      relevant_scenarios s,
      metrics_metadata m
    WHERE(m.scenario_slug = s.slug
      OR m.scenario_slug IS NULL)
    AND m.study_slug = study_slug_arg
    AND m.theme_slug = theme_slug_arg
  )
  -- Reduce to only include preferred fields
  SELECT
    field_name,
    description,
    units,
    study_slug,
    theme_slug,
    category,
    usage,
    source,
    slug AS scenario_slug
  FROM
    ranked_metrics_metadata
  WHERE
    pos = 1
$$
LANGUAGE sql
STABLE;

CREATE OR REPLACE FUNCTION get_data_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT '')
  RETURNS TABLE(
    scenario_slug text,
    geometry_key text,
    data jsonb
  )
  AS $$
  SELECT
    scenario_slug,
    geometry_key,
    jsonb_object_agg(category || '.' || coalesce(usage, 'ALL') || '.' || coalesce(source, 'ALL'), data -> m_m.field_name) AS data
  FROM
    metrics m,
    get_metrics_metadata_for_scenarios(study_slug_arg, theme_slug_arg, scenario_slug_arg) m_m
  WHERE
    m.study_slug = study_slug_arg
  GROUP BY
    scenario_slug,
    geometry_key
$$
LANGUAGE sql
STABLE;

CREATE OR REPLACE FUNCTION get_aggregation_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT '')
  RETURNS TABLE(
    scenario_slug text,
    data jsonb
  )
  AS $$
  WITH scenario_metrics AS(
    SELECT
      *
    FROM
      get_data_for_scenarios(study_slug_arg, theme_slug_arg, scenario_slug_arg)
  ),
  aggregated_keys AS(
    SELECT
      scenario_slug,
      key,
      sum(value::numeric) AS sum_value
    FROM
      scenario_metrics,
      LATERAL jsonb_each_text(data) AS each(key,
        value)
    GROUP BY
      scenario_slug,
      key
  )
  SELECT
    scenario_slug,
    jsonb_object_agg(key, sum_value)
  FROM
    aggregated_keys
  GROUP BY
    scenario_slug
$$
LANGUAGE sql
STABLE;

