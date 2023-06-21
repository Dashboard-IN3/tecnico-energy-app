import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";

async function insertBuildings(buildingsData: { features: any[] }) {
  const buildings: string[] = [];

  for (const building of buildingsData.features) {
    const {
      geometry,
      properties: { Name, ...properties },
    } = building;
    buildings.push(
      `(
        '${Name}', 
        '${JSON.stringify(geometry)}', 
        '${JSON.stringify(properties)}'
      )`
    );
  }

  console.log(`Inserting ${buildings.length} buildings...`);
  await prisma.$executeRawUnsafe(`
    INSERT INTO buildings (name, geom, properties)
    VALUES ${buildings.join(",")}
    ON CONFLICT (name) DO NOTHING;  -- TODO: Update to overwrite
  `);
}

async function main() {
  const directoryPath = "./data";
  const files = fs.readdirSync(directoryPath);

  console.log(`Parsing buildings.geojson`);
  const buildingsData = JSON.parse(
    fs.readFileSync(path.join(directoryPath, "buildings.geojson"), "utf-8")
  );
  await insertBuildings(buildingsData);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    if (path.extname(file) === ".csv") {
      console.log(`Parsing ${file}`);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Assuming your CSV has headers and each row represents a building
      const rows = fileContent
        .trim()
        .split("\n")
        .slice(1)
        .flatMap((row) => {
          const [
            buildingId,
            buildingName,
            metric,
            units,
            resolution,
            ...readings
          ] = row.split(",");

          const metrics: Metric[] = [];

          for (let i = 0; i < readings.length; i++) {
            const value = parseFloat(readings[i]);
            metrics.push({ buildingName, metric, value, hour: i + 1 });
          }

          return metrics;
        });

      const chunkSize = 100_000;
      const start = new Date().getTime();
      for (let i = 0; i < rows.length; i += chunkSize) {
        const percent = Math.round(((i + chunkSize) / rows.length) * 100);
        const rate = Math.round(i / ((new Date().getTime() - start) / 1000));
        console.log(
          `Inserting ${i} - ${i + chunkSize} / ${
            rows.length
          } metrics (${percent}%, ${rate}/s)...`
        );
        await prisma.metrics.createMany({
          data: rows.slice(i, i + chunkSize),
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

interface Metric {
  buildingName: string;
  metric: string;
  value: number;
  hour: number;
}
