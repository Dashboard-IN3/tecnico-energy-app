SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
    pg_catalog.set_config('search_path', '', FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

ALTER SCHEMA public OWNER TO postgres;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

CREATE TYPE public.study_scale AS ENUM(
    'Municipality',
    'Building'
);

ALTER TYPE public.study_scale OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.geometries(
    name text NOT NULL,
    study_slug text NOT NULL,
    geom public.geometry NOT NULL
);

ALTER TABLE public.geometries OWNER TO postgres;

CREATE TABLE public.metrics(
    study_slug text NOT NULL,
    geometry_key text NOT NULL,
    data jsonb NOT NULL
);

ALTER TABLE public.metrics OWNER TO postgres;

CREATE TABLE public.metrics_metadata(
    field_name text NOT NULL,
    description text NOT NULL,
    units text NOT NULL,
    study_slug text NOT NULL,
    theme_slug text NOT NULL,
    category text,
    usage text,
    source text,
    scenario_slug text
);

ALTER TABLE public.metrics_metadata OWNER TO postgres;

CREATE TABLE public.scenario(
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    methodology text,
    study_slug text NOT NULL
);

ALTER TABLE public.scenario OWNER TO postgres;

CREATE TABLE public.study(
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    details text,
    image_src text,
    centroid_coordinates double precision[] DEFAULT ARRAY[(0) ::double precision,(0) ::double precision],
    zoom_level_start integer DEFAULT 14 NOT NULL,
    bbox double precision[] DEFAULT ARRAY[(0) ::double precision,(0) ::double precision,(0) ::double precision,(0) ::double precision],
    study_scale public.study_scale NOT NULL
);

ALTER TABLE public.study OWNER TO postgres;

CREATE TABLE public.theme(
    slug text NOT NULL,
    name text NOT NULL,
    study_slug text NOT NULL
);

ALTER TABLE public.theme OWNER TO postgres;

ALTER TABLE ONLY public.geometries
    ADD CONSTRAINT geometries_pkey PRIMARY KEY (name);

ALTER TABLE ONLY public.metrics_metadata
    ADD CONSTRAINT metrics_metadata_pkey PRIMARY KEY (study_slug, field_name);

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (study_slug, geometry_key);

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_pkey PRIMARY KEY (slug);

ALTER TABLE ONLY public.study
    ADD CONSTRAINT study_pkey PRIMARY KEY (slug);

ALTER TABLE ONLY public.theme
    ADD CONSTRAINT theme_pkey PRIMARY KEY (study_slug, slug);

CREATE UNIQUE INDEX geometries_name_key ON public.geometries USING btree(name);

CREATE INDEX geometries_study_slug_idx ON public.geometries USING btree(study_slug);

CREATE INDEX theme_study_slug_idx ON public.theme USING btree(study_slug);

ALTER TABLE ONLY public.geometries
    ADD CONSTRAINT geometries_study_slug_fkey FOREIGN KEY (study_slug) REFERENCES public.study(slug) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_geometry_key_fkey FOREIGN KEY (geometry_key) REFERENCES public.geometries(name) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.metrics_metadata
    ADD CONSTRAINT metrics_metadata_scenario_slug_fkey FOREIGN KEY (scenario_slug) REFERENCES public.scenario(slug) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.metrics_metadata
    ADD CONSTRAINT metrics_metadata_study_slug_fkey FOREIGN KEY (study_slug) REFERENCES public.study(slug) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.metrics_metadata
    ADD CONSTRAINT metrics_metadata_study_slug_theme_slug_fkey FOREIGN KEY (study_slug, theme_slug) REFERENCES public.theme(study_slug, slug) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_study_slug_fkey FOREIGN KEY (study_slug) REFERENCES public.study(slug) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_study_slug_fkey FOREIGN KEY (study_slug) REFERENCES public.study(slug) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.theme
    ADD CONSTRAINT theme_study_slug_fkey FOREIGN KEY (study_slug) REFERENCES public.study(slug) ON UPDATE CASCADE ON DELETE RESTRICT;

REVOKE USAGE ON SCHEMA public FROM PUBLIC;

INSERT INTO public.study(slug, name, description, study_scale)
    VALUES ('lisbon-building-energy', 'Lisbon Building Energy', 'Energy consumption of buildings in Lisbon', 'Building')
ON CONFLICT
    DO NOTHING;

INSERT INTO public.theme(slug, name, study_slug)
    VALUES ('Building', 'Building', 'lisbon-building-energy'),
('waste', 'Waste', 'lisbon-building-energy'),
('mobility', 'Mobility', 'lisbon-building-energy')
ON CONFLICT
    DO NOTHING;

;

INSERT INTO public.scenario(slug, name, study_slug, description, methodology)
    VALUES ('lightbulbs', 'Replace lightbulbs', 'lisbon-building-energy', 'Replace all lightbulbs with LED bulbs', 'Replace all lightbulbs with LED bulbs')
ON CONFLICT
    DO NOTHING;

INSERT INTO public.metrics_metadata(study_slug, field_name, theme_slug, category, usage, source, description, units, scenario_slug)
    VALUES ('lisbon-building-energy', 'e_total', 'Building', 'Energy', NULL, NULL, 'Total energy consumption', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_h_total', 'Building', 'Energy', 'Heating', NULL, 'Total consumption for heating', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_c_total', 'Building', 'Energy', 'Cooling', NULL, 'Total consumption for cooling', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_h_gas', 'Building', 'Energy', 'Heating', 'Gas', 'Gas consumption for heating', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_h_electricity', 'Building', 'Energy', 'Heating', 'Electricity', 'Electricity consumption for heating', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_c_electricity', 'Building', 'Energy', 'Cooling', 'Electricity', 'Electricity consumption for cooling', 'kWh/m2', NULL),
('lisbon-building-energy', 'e_c_gas', 'Building', 'Energy', 'Cooling', 'Gas', 'Gas consumption for cooling', 'kWh/m2', NULL),
('lisbon-building-energy', 'cost_total', 'Building', 'Cost', NULL, NULL, 'Total cost of energy consumption', '€/m2', NULL),
('lisbon-building-energy', 'impact_total', 'Building', 'Impact', NULL, NULL, 'Total carbon impact of energy consumption', 'CO2 tonne/yr', NULL),
('lisbon-building-energy', 'e_total_w_lightbulbs', 'Building', 'Energy', NULL, NULL, 'Total energy consumption after lightbulbs', 'kWh/m2', 'lightbulbs')
ON CONFLICT
    DO NOTHING;

;

INSERT INTO public.geometries(name, study_slug, geom)
    VALUES ('A', 'lisbon-building-energy', 'POLYGON((0.0 0.0, 3.1622776601683795 0.0, 3.1622776601683795 3.1622776601683795, 0.0 3.1622776601683795, 0.0 0.0))'),
('B', 'lisbon-building-energy', 'POLYGON((5.16227766016838 0.0, 8.32455532033676 0.0, 8.32455532033676 3.1622776601683795, 5.16227766016838 3.1622776601683795, 5.16227766016838 0.0))'),
('C', 'lisbon-building-energy', 'POLYGON((10.32455532033676 0.0, 13.48683298050514 0.0, 13.48683298050514 3.1622776601683795, 10.32455532033676 3.1622776601683795, 10.32455532033676 0.0))'),
('D', 'lisbon-building-energy', 'POLYGON((0.0 5.16227766016838, 3.1622776601683795 5.16227766016838, 3.1622776601683795 8.32455532033676, 0.0 8.32455532033676, 0.0 5.16227766016838))'),
('E', 'lisbon-building-energy', 'POLYGON((5.16227766016838 5.16227766016838, 8.32455532033676 5.16227766016838, 8.32455532033676 8.32455532033676, 5.16227766016838 8.32455532033676, 5.16227766016838 5.16227766016838))'),
('F', 'lisbon-building-energy', 'POLYGON((10.32455532033676 5.16227766016838, 13.48683298050514 5.16227766016838, 13.48683298050514 8.32455532033676, 10.32455532033676 8.32455532033676, 10.32455532033676 5.16227766016838))'),
('G', 'lisbon-building-energy', 'POLYGON((0.0 10.32455532033676, 3.1622776601683795 10.32455532033676, 3.1622776601683795 13.48683298050514, 0.0 13.48683298050514, 0.0 10.32455532033676))'),
('H', 'lisbon-building-energy', 'POLYGON((5.16227766016838 10.32455532033676, 8.32455532033676 10.32455532033676, 8.32455532033676 13.48683298050514, 5.16227766016838 13.48683298050514, 5.16227766016838 10.32455532033676))'),
('I', 'lisbon-building-energy', 'POLYGON((10.32455532033676 10.32455532033676, 13.48683298050514 10.32455532033676, 13.48683298050514 13.48683298050514, 10.32455532033676 13.48683298050514, 10.32455532033676 10.32455532033676))')
ON CONFLICT
    DO NOTHING;

INSERT INTO public.metrics(study_slug, geometry_key, data)
    VALUES ('lisbon-building-energy', 'A', '{"e_total": 100, "e_h_total": 50, "e_c_total": 50, "e_h_gas": 25, "e_h_electricity": 25, "e_c_electricity": 25, "e_c_gas": 25, "cost_total": 1000, "impact_total": 10, "e_total_w_lightbulbs": 10.5}'),
('lisbon-building-energy', 'B', '{"e_total": 200, "e_h_total": 100, "e_c_total": 100, "e_h_gas": 50, "e_h_electricity": 50, "e_c_electricity": 50, "e_c_gas": 50, "cost_total": 2000, "impact_total": 20, "e_total_w_lightbulbs": 20.5}'),
('lisbon-building-energy', 'C', '{"e_total": 300, "e_h_total": 150, "e_c_total": 150, "e_h_gas": 75, "e_h_electricity": 75, "e_c_electricity": 75, "e_c_gas": 75, "cost_total": 3000, "impact_total": 30, "e_total_w_lightbulbs": 30.5}'),
('lisbon-building-energy', 'D', '{"e_total": 400, "e_h_total": 200, "e_c_total": 200, "e_h_gas": 100, "e_h_electricity": 100, "e_c_electricity": 100, "e_c_gas": 100, "cost_total": 4000, "impact_total": 40, "e_total_w_lightbulbs": 40.5}'),
('lisbon-building-energy', 'E', '{"e_total": 500, "e_h_total": 250, "e_c_total": 250, "e_h_gas": 125, "e_h_electricity": 125, "e_c_electricity": 125, "e_c_gas": 125, "cost_total": 5000, "impact_total": 50, "e_total_w_lightbulbs": 50.5}'),
('lisbon-building-energy', 'F', '{"e_total": 600, "e_h_total": 300, "e_c_total": 300, "e_h_gas": 150, "e_h_electricity": 150, "e_c_electricity": 150, "e_c_gas": 150, "cost_total": 6000, "impact_total": 60, "e_total_w_lightbulbs": 60.5}'),
('lisbon-building-energy', 'G', '{"e_total": 700, "e_h_total": 350, "e_c_total": 350, "e_h_gas": 175, "e_h_electricity": 175, "e_c_electricity": 175, "e_c_gas": 175, "cost_total": 7000, "impact_total": 70, "e_total_w_lightbulbs": 70.5}'),
('lisbon-building-energy', 'H', '{"e_total": 800, "e_h_total": 400, "e_c_total": 400, "e_h_gas": 200, "e_h_electricity": 200, "e_c_electricity": 200, "e_c_gas": 200, "cost_total": 8000, "impact_total": 80, "e_total_w_lightbulbs": 80.5}'),
('lisbon-building-energy', 'I', '{"e_total": 900, "e_h_total": 450, "e_c_total": 450, "e_h_gas": 225, "e_h_electricity": 225, "e_c_electricity": 225, "e_c_gas": 225, "cost_total": 9000, "impact_total": 90, "e_total_w_lightbulbs": 90.5}')
ON CONFLICT (study_slug, geometry_key)
    DO UPDATE SET
        data = EXCLUDED.data;

-- Demo of building metrics mappings, specifying the source and destination of every relevant metric
SELECT
    field_name AS src,
    category || '/' || coalesce(usage, 'ALL') || '/' || coalesce(source, 'ALL') AS dst
FROM
    metrics_metadata
WHERE
    study_slug = 'lisbon-building-energy'
    AND theme_slug = 'Building'
    AND scenario_slug IS NULL;

-- Demo of taking metrics mapping and using that to retrieve pertinent records from metrics table and generating output objects
WITH mappings AS (
    SELECT
        field_name AS src,
        category || '/' || coalesce(usage, 'ALL') || '/' || coalesce(source, 'ALL') AS dst
    FROM
        metrics_metadata
    WHERE
        study_slug = 'lisbon-building-energy'
        AND theme_slug = 'Building'
        AND scenario_slug IS NULL
),
transformed_data AS (
    SELECT
        geometry_key,
        jsonb_object_agg(m.dst, data -> m.src) AS transformed_json
    FROM
        metrics,
        mappings m
    WHERE
        study_slug = 'lisbon-building-energy'
    GROUP BY
        geometry_key
)
SELECT
    *
FROM
    transformed_data;

-- Demo of taking metrics mapping and using that to retrieve pertinent records from metrics table and generating more rich output objects
WITH mappings AS (
    SELECT
        field_name AS src,
        category || '/' || coalesce(usage, 'ALL') || '/' || coalesce(source, 'ALL') AS dst
    FROM
        metrics_metadata
    WHERE
        study_slug = 'lisbon-building-energy'
        AND theme_slug = 'Building'
        AND scenario_slug IS NULL
),
pre_transformed_data AS (
    SELECT
        geometry_key,
        m.dst,
        -- HERE WE'RE BUILDING A JSON OBJECT WITH THE VALUE AND THE SOURCE FIELD. WE COULD INJECT ANY METADATA DESIRED.
        -- HOWEVER, I THINK IT MAY BE BETTER TO DO THIS AT THE END OF THE QUERY WITH ANOTHER JOIN TO `mappings``
        jsonb_build_object('value', data -> m.src, 'src_field', m.src) AS value_details
    FROM
        metrics,
        mappings m
    WHERE
        study_slug = 'lisbon-building-energy'
        AND data ? m.src
),
transformed_data AS (
    SELECT
        geometry_key,
        jsonb_object_agg(dst, value_details) AS transformed_json
    FROM
        pre_transformed_data
    GROUP BY
        geometry_key
)
SELECT
    *
FROM
    transformed_data;

-- Let's demonstrate adding a scenario
WITH all_mappings AS (
    SELECT
        field_name AS src,
        category || '/' || coalesce(usage, 'ALL') || '/' || coalesce(source, 'ALL') AS dst,
        scenario_slug
    FROM
        metrics_metadata
    WHERE
        study_slug = 'lisbon-building-energy'
        AND theme_slug = 'Building'
        AND scenario_slug IS NULL
        OR scenario_slug = 'lightbulbs'
),
ranked_mappings AS (
    SELECT
        m.*,
        rank() OVER (PARTITION BY m.dst ORDER BY scenario_slug DESC NULLS LAST) AS pos
    FROM
        all_mappings m
)
SELECT
    src,
    dst
FROM
    ranked_mappings
WHERE
    pos = 1;

