/*
Function: get_metrics_metadata_for_scenarios

Description: Retrieve all of the fields to be used for a given study, theme, and optionally scenario.

Parameters:
- study_slug_arg: The slug of the study.
- theme_slug_arg: The slug of the theme.
- scenario_slug_arg: (Optional) The slug of the scenario. If not provided, all scenarios will be considered.

Returns: None
 */
CREATE FUNCTION public.get_metrics_metadata_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT ''::text)
  RETURNS SETOF public.metrics_metadata
  LANGUAGE sql
  STABLE
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
      AND CASE WHEN scenario_slug_arg = '' THEN
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
  AND m.theme_slug = theme_slug_arg)
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
$$;


/**
 * Function: get_data_for_scenarios
 * Description: Retrieve metrics for geometries by selecting appropriate field based on theme and scenario. Metrics are normalized to destination field.
 * Parameters:
 *   - study_slug_arg: The slug of the study.
 *   - theme_slug_arg: The slug of the theme.
 *   - scenario_slug_arg: (Optional) The slug of the scenario. If not provided, all scenarios will be retrieved.
 * Returns: The data for the specified scenarios.
 */
CREATE OR REPLACE FUNCTION public.get_data_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT ''::text)
  RETURNS TABLE(
    scenario_slug text,
    geometry_key text,
    data jsonb)
  LANGUAGE sql
  STABLE
  AS $$
  SELECT
    scenario_slug,
    geometry_key,
    jsonb_object_agg(
      category || '.' || coalesce(usage, 'ALL') || '.' || coalesce(source, 'ALL'), 
      jsonb_build_object(
        'value', round((data -> lower(m_m.field_name))::numeric, 2), 
        'src_field', m_m.field_name,
        'units', m_m.units,
        'description', m_m.description
      )
    ) AS data
  FROM
    metrics m,
    get_metrics_metadata_for_scenarios(study_slug_arg, theme_slug_arg, scenario_slug_arg) m_m
WHERE
  m.study_slug = study_slug_arg
GROUP BY
  scenario_slug,
  geometry_key
$$;


/*
 Function: get_aggregation_for_scenarios
 
 Description: Retrieves the aggregation data for scenarios based on study, theme, and optional scenario slug.
 
 Parameters:
 - study_slug_arg: The slug of the study.
 - theme_slug_arg: The slug of the theme.
 - scenario_slug_arg: (Optional) The slug of the scenario. If not provided, all scenarios will be considered.
 */
CREATE OR REPLACE FUNCTION public.get_aggregation_for_scenarios(study_slug_arg text, theme_slug_arg text, scenario_slug_arg text DEFAULT ''::text)
  RETURNS TABLE(
    scenario_slug text,
    data jsonb)
  LANGUAGE sql
  STABLE
  AS $$
  WITH aggregated_keys AS(
    SELECT
      scenario_slug,
      key,
      jsonb_build_object(
        'value', sum(coalesce((value::jsonb ->> 'value')::numeric, 0)::numeric), 
        'src_field', value::jsonb -> 'src_field',
        'units', value::jsonb -> 'units',
        'description', value::jsonb -> 'description'
      ) as sum_value
    FROM
      get_data_for_scenarios(study_slug_arg, theme_slug_arg, scenario_slug_arg),
      LATERAL jsonb_each_text(data) AS each(key, value)
    GROUP BY
      scenario_slug,
      key,
      value::jsonb->'src_field',
      value::jsonb->'units',
      value::jsonb->'description'
)
  SELECT
    scenario_slug,
    jsonb_object_agg(key, sum_value)
  FROM
    aggregated_keys
  GROUP BY
    scenario_slug
$$;

