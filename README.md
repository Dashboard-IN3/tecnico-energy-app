# Técnico Application

Based off of the [Vercel Postgres + Prisma Next.js Starter](https://vercel.com/templates/next.js/postgres-prisma). This utilizes the following tools:

- [Next.js](https://nextjs.org/) - React.js framework
- [Prisma](https://www.prisma.io/) - database modeling/ORM
- [Tailwind](https://tailwindcss.com/) - CSS framework

## Development

### Install

```bash
pnpm install
```

### Secrets

To obtain configuration for your local development environment:

```bash
npx vercel env pull .env
```

### Setup database

First, let's create a local database and user for the app to use during devleopment.

```bash
createdb tecnico
psql tecnico -c "CREATE ROLE tecnico_user WITH LOGIN SUPERUSER PASSWORD 'secretpass';"
```

To do a quick and dirty setup of our dev db (not using migrations):

```bash
# Push our DB schema to database
npx prisma db push
```

See [Schema prototyping with db push](https://www.prisma.io/docs/guides/migrate/prototyping-schema-db-push) for more information.

### Load data

#### Buildings

To turn our Shapefile of buildings (`shapefile.shp`) in EPSG:32729 into a GeoJSON in EPSG:4326:

```bash
ogr2ogr -f GeoJSON -s_srs EPSG:32729 -t_srs EPSG:4326 buildings.geojson shapefile.shp
```

To insert these records into our local database:

```bash
# Convert our geojson to a CSV of building name, geometry, & properties (without building name) and pipe to postgres database
cat data/buildings.geojson | jq -r '.features[] | .properties.Name + ";" + (.geometry | tojson) + ";" + (del(.properties.Name) | .properties | tojson)' | psql tecnico -c "copy buildings from stdin (delimiter ';');"
```

You should see something like `COPY 5193` as output.

#### Metrics

To insert these records into our local database, run the following command in a directory with our CSVs:

```python
python3 <<EOF | psql tecnico -c "copy metrics(building_name, dt, cooling, total_operational_energy, lighting, domestic_hot_water, equipment, window_radiation, heating) from stdin (format csv, header)"
import datetime
import os
import csv
import sys

format_header = lambda h: h.split('/').pop().replace(' ', '_').lower()

csv_files = [open(f, 'r') for f in os.listdir() if f.endswith('.csv')]
metric_names = [format_header(next(csv.DictReader(csv_file))['Metric']) for csv_file in csv_files]
[f.seek(0) for f in csv_files] # Reset files

readers = zip(*[csv.DictReader(csv_file) for csv_file in csv_files])

writer = csv.DictWriter(sys.stdout, fieldnames=['building_name', 'dt', *metric_names])
writer.writeheader()

for row_num, row in enumerate(readers, 1):
  building_names = set(r['Building Name'] for r in row)
  assert len(building_names) == 1, 'Got differing buildings'
  building_name = building_names.pop()

  # {'metric1': ['0.3', '0.1' ...], 'metric2': ['0.9', '0.4', ...], ...}
  metrics = {r['Metric']: list(r.values())[5:] for r in row}
  # [{'metric1': '0.3', 'metric2': '0.9', ...}, {'metric1': '0.1', 'metric2': '0.4', ...} ...]
  metrics_by_hour = [dict(zip((format_header(h) for h in metrics.keys()), values)) for values in zip(*metrics.values())]

  # Some row contain null values. We skip those.
  if any(not metric for metric in metrics_by_hour[0].values()):
    print(f"WARNING: no value for row {row_num} ({building_name})", file=sys.stderr)
    continue

  for hour, metrics in enumerate(metrics_by_hour, 1):
    writer.writerow({
      'building_name': building_name,
      'dt': datetime.datetime(2021,1,1) + datetime.timedelta(hours=hour),
      **metrics
    })
EOF
```

This operation can take a fair amount of time to complete (15-20 minutes). Once complete, you should see something like `COPY 43440840` as output.

### Running the Application

Run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples) ([Documentation](https://nextjs.org/docs/deployment)).
