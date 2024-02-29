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
    VALUES ('lightbulbs', 'Replace lightbulbs', 'lisbon-building-energy', 'Replace all lightbulbs with LED bulbs', 'Replace all lightbulbs with LED bulbs'),
('lower-cost', 'Lower cost', 'lisbon-building-energy', 'What if we just lowered all the costs? ', 'We take the costs, and then we just drop them.')
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
('lisbon-building-energy', 'e_total_w_lightbulbs', 'Building', 'Energy', NULL, NULL, 'Total energy consumption after lightbulbs', 'kWh/m2', 'lightbulbs'),
('lisbon-building-energy', 'e_h_total_w_lightbulbs', 'Building', 'Energy', 'Heating', NULL, 'Total energy consumption after lightbulbs', 'kWh/m2', 'lightbulbs'),
('lisbon-building-energy', 'lower_cost_total', 'Building', 'Cost', NULL, NULL, 'Lowered total cost of energy consumption', '€/m2', 'lower-cost')
ON CONFLICT
    DO NOTHING;

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