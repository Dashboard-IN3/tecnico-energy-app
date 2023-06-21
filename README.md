# NextJS + Postgres + Prisma

## Data Prep

To turn our wide timeseries CSVs into long CSVs that better match our DB tables, run the following in a directory with our CSVs:

```python
import datetime
import os
import csv
import smart_open

for f in os.listdir():
    if not f.endswith('.csv'):
        continue

    print(f)
    with open(f, 'r') as f_in:

        out_name = f.split('.csv')[0] + '.reformat.csv.gz'
        with smart_open.open(out_name, 'w') as f_out:

            reader = csv.DictReader(f_in)
            writer = csv.DictWriter(f_out, fieldnames=['building_name', 'metric', 'dt', 'value'])
            writer.writeheader()

            for row in reader:
                building_name = row['Building Name']
                metric = row['Metric']

                if not row['1']:
                    print(f"WARNING: no value for {building_name}/{metric}")
                    continue

                for hour in range(1, 8761):
                    value = row[str(hour)]
                    writer.writerow({
                      'building_name': building_name,
                      'metric': metric,
                      'dt': datetime.datetime(2021,1,1) + datetime.timedelta(hours=hour),
                      'value': value
                    })
```

NOTE: We gzip the output CSVs to save disk space, each CSV would be over 1GB otherwise.

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

First, let's create a local database and user.

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

```bash
# Convert our geojson to a CSV of building name, geometry, & properties (without building name) and pipe to postgres database
cat data/buildings.geojson | jq -r '.features[] | .properties.Name + ";" + (.geometry | tojson) + ";" + (del(.properties.Name) | .properties | tojson)' | psql tecnico -c "copy buildings from stdin (delimiter ';');"
```

You should see something like `COPY 5193` as output.

Now lets load our CSVs:

```bash
for f in data/*.csv.gz; do
  echo $f;
  zcat < $f | psql tecnico -c "copy metrics(building_name, metric, dt, value) from stdin (format csv, header)";
done
```

### Running the Application

Run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples) ([Documentation](https://nextjs.org/docs/deployment)).
