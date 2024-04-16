

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
        'sum', sum(coalesce((value::jsonb ->> 'value')::numeric, 0)::numeric), 
        'avg', avg(coalesce((value::jsonb ->> 'value')::numeric, 0)::numeric), 
        'min', min(coalesce((value::jsonb ->> 'value')::numeric, 0)::numeric), 
        'max', max(coalesce((value::jsonb ->> 'value')::numeric, 0)::numeric), 
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
