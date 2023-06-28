# 1. Initial technology selection

Date: 2023-06-22

## Context

In order to break ground on the project, the development team should identify which tools to be used to develop the application. The decisions are based on various factors, including the requirements of the project, the team's familiarity with the technologies, their popularity within the development community, and their suitability for the project's needs. The project's timeline and budget both suggest that emphasis should be placed on selecting tools that the development team is familiar with in order to minimize the amount of time spent on learning new tools.

### Project Needs

While the fine details of the application's interface are still being designed, it is safe to say that the application will almost surely have the following properties:

- **Data Intensive**: The primary focus of the application is performing analysis on high-resolution (hourly) timeseries data with a corresponding spatial context. This indicates that the application will handle a significant amount of data processing and manipulation, requiring efficient storage, retrieval, and computation capabilities.

- **Infrequent Updates**: Data will update on an infrequent basis as requested by the partner. This implies that the application's focus is not on real-time data streaming or continuous updates, but rather on providing analytical capabilities on static or periodically updated datasets.

- **Web Access Only**: The application is designed to be accessed exclusively through a web interface. Users will interact with the application using web browsers, and all functionality and data will be accessible through the web interface. This decision eliminates the need to develop and maintain a generic API layer, simplifying the architecture and focusing efforts on delivering a seamless and user-friendly web experience. By providing web access only, we can ensure consistent and controlled access to the application while maintaining a unified user interface for all interactions.

## Decision 1: Next.js

### Reasons:

1. **Frontend & Backend**: Next.js provides a unified framework for developing both frontend and backend components, enabling us to create a seamless, integrated application without the need for separate frontend and backend frameworks. This simplifies development, deployment, and maintenance.

2. **Popularity**: Next.js has gained significant popularity and has a thriving community. This ensures a wide range of available resources, tutorials, and plugins that can aid in the development process, provide community support, and facilitate troubleshooting.

3. **Familiarity**: Our team members are already familiar with Next.js, reducing the learning curve and allowing us to leverage their existing expertise, resulting in increased development efficiency and reduced potential risks associated with adopting unfamiliar technologies.

## Decision 2: Vercel for Hosting, Edge Network, and Continuous Integration (CI)

### Reasons:

1. **Hosting**: Vercel provides a reliable and scalable hosting platform, allowing us to deploy and serve our application seamlessly. With Vercel's global edge network, which operates as both a Content Delivery Network (CDN) and a globally distributed platform for running compute, we can ensure optimal performance and availability for our users.

2. **Vercel Functions**: Vercel Functions provide serverless functionality, enabling us to execute backend logic and handle API requests efficiently. By leveraging serverless functions, we can achieve cost savings by paying only for the actual execution time and resources used, rather than maintaining and paying for dedicated server instances. This ensures that we have a cost-effective solution for running our backend logic while maintaining high scalability and performance.

3. **Serverless Postgres Offering**: Vercel seamlessly integrates with various databases, including neon.tech's serverless Postgres offering. This integration allows us to connect and interact with the serverless Postgres database provided by neon.tech. By utilizing this serverless database offering, we can further optimize cost savings by only paying for the actual usage of database resources. This ensures that we have an efficient and cost-effective solution for managing our data storage and retrieval needs.

4. **Continuous Integration (CI)**: Vercel offers robust and user-friendly continuous integration capabilities, automating the build, test, and deployment processes. This streamlines our development workflow, enhances code quality, and reduces the risk of introducing bugs or errors during deployment.

5. **PR Preview**: Vercel's PR preview functionality allows us to create preview deployments for each pull request. This enables us to have a dedicated environment where changes made in the pull request can be reviewed, tested, and validated before merging them into the main branch. It facilitates collaboration, reduces the risk of introducing regressions, and ensures that only validated changes are deployed to production.

6. **Popularity**: Vercel has gained significant popularity as both a hosting platform and a solution for leveraging its powerful edge network. Its reliability, performance, and extensive feature set are well-documented. By leveraging Vercel for hosting, CI, and taking advantage of its edge network, we can provide an optimal user experience with fast content delivery, low latency, efficient execution of backend logic, and a streamlined development process.

7. **Simplified Account Management**: Utilizing a single account for all services on Vercel simplifies the billing process. Instead of managing separate billing arrangements and invoices for different services, we can consolidate all costs into a single account. This provides a clear and centralized view of the expenses associated with the application, making budgeting and financial management more straightforward.

## Decision 3: Prisma for Migrations, ORM, and Typing

### Reasons:

1. **Migrations**: Prisma offers comprehensive migration capabilities, enabling us to manage database schema changes efficiently. This simplifies the process of evolving the database structure while ensuring data integrity and preserving existing data.

2. **ORM**: Prisma provides a powerful Object-Relational Mapping (ORM) layer, simplifying database interactions and abstracting away low-level SQL queries. This improves productivity by offering a more expressive and intuitive API for database operations.

3. **Typing**: Prisma supports automated strong typing, allowing us to define and enforce type safety within our codebase. This reduces the likelihood of runtime errors and enhances code readability, maintainability, and collaboration.

4. **Popularity**: Prisma has gained widespread adoption within the developer community. Its popularity ensures continuous improvements, active maintenance, and a supportive community that can assist with troubleshooting and knowledge sharing.

## Decision 4: PostgreSQL with PostGIS and TimescaleDB

### Reasons:

1. **PostGIS**: PostGIS is a spatial database extension for PostgreSQL, providing robust geospatial capabilities. By using PostGIS, we can efficiently store, query, and analyze spatial data, which is essential for our project's requirements involving geolocation and mapping functionality. Additionally, its support for generating vector tiles eliminates the need for a separate tiling service for visualizing spatial information.

2. **TimescaleDB**: TimescaleDB is a time-series database extension for PostgreSQL, optimized for handling large volumes of time-series data efficiently. Its integration with PostgreSQL enables us to store and query time-series data with high performance, making it suitable for scenarios where we need to process and analyze time-stamped data effectively.

3. **Popularity**: PostgreSQL, along with its extensions PostGIS and TimescaleDB, is widely adopted, well-supported, and trusted by the developer community. Its popularity ensures the availability of extensive documentation, active community support, and frequent security updates.

4. **Familiarity**: Our team members have prior experience with PostgreSQL, making it a familiar choice. This familiarity reduces the learning curve, facilitates efficient development, and allows us to leverage existing expertise in database management and optimization.

## Consequences

### Database

1. **Cold Starts**: One of the shortcomings of using a serverless PostgreSQL database is the potential for cold starts. The Vercel Postgres documentation [[1]] describes cold starts as such:

   > An inactive Vercel Postgres database may experience cold starts. If your database is not accessed within a 5 minute period, your database will be suspended. The next time it is accessed, you will experience a "cold start" of up to 5 seconds.

   We can minimize the amounts of API requests that are affected by cold starts by relying on an aggressive caching strategy to avoid interacting with the DB for redundant queries. However, for new/dynamic queries, the cold start is an unfortunate side-effect of the system. If these cold starts prove are deemed unacceptable, possible solutions include:

   1. Optimistic wake-ups. When a viewer first visits the application, we could ping the database to get a head start on waking any potential-suspended database. This would likely increase the billed database compute hours but could provide for better response-time on any user-initiated queries.
   1. Use an always-on database. By swapping out Vercel's serverless PostgreSQL for a more-standard alway-on database provider, we would eliminate cold start issues. This would come with consequence of increased monthly costs and adding another expense account to manage.

1. **Sizing Limitations**: With traditional always-on databases, if data-access performance is deemed inadequate after best efforts are made to optimize the database schema and queries, then the database instance's RAM and CPU allocation can be adjusted to provide better performance. With Vercel's serverless PostgreSQL offering, this is not an option. If database performance is deemed unacceptable, possible solutions include:

   1. Migrate database service to an alternative always-on Postgresql provider. This would come with consequence of increased monthly costs and adding another expense account to manage.
  
1. **TimescaleDB License**: As stipulated by the TimescaleDB License Agreement ([3]), database-as-a-service (DBaaS) providers (e.g. Vercel Database, Neon, AWS RDS) are only permitted to provide the Apache 2 version of TimescaleDB while self-hosted deployments and Timescale (a DBaaS solution provided by the creators of TimescaleDB) can run the Timescale Community Edition version. The Apache 2 version of TimescaleDB offers a subset of the features included in the Community Edition version ([4]). Missing features that could be of interest to this project include compression and certain advanced hypertable functions. In the event that this functionality is considered highly-desired, possible solutions include:

   1. Migrate database service to a self-hosted solution, such as running the database within AWS EC2. Attention should be given to also ensuring that a connection pooling service such as pgBouncer is available to avoid exhausting connections by the serverless Vercel Functions. This would come with consequence of a possible increase monthly costs, increased system architecture complexity, and adding another expense account to manage.
   2. Migrate database to Timescale. This would come with consequence of a likely increase monthly costs and adding another expense account to manage.

### Vercel Functions

1. **IP Addresses**: A concern with using a serverless function to access the database is the lack of knowledge about the IP address from which the function will be invoked. Vercel does not publish a list of the IP addresses it uses for its services, instead recommending allowing all IP addresses [2]. Not imposing IP address restrictions on database access may fail security audits.
1. **60 Second Timeout**: On the Vercel Pro plan, serverless functions have a 60-second timeout. This imposes limitations on the type of tasks that can be efficiently executed within that timeframe. Long-running operations or computations that require more time to complete may exceed the timeout limit, resulting in function termination and incomplete processing. In the event that operations longer than 60 seconds are necessary, possible solutions include:

   1. Adding an asyncronous job queue from a third-party, wherein worker services would read from the queue and perform long-running tasks. This would come at the cost of added complexity and cost to the system.

### Vercel Platform

1. **No Async Computing**: A concern with Vercel is the absence of an asynchronous computing option, which can pose challenges when dealing with long-running or computationally intensive tasks that require non-blocking operations. Vercel's architecture primarily focuses on serverless functions and static content hosting, making it less suitable for efficiently handling tasks such as background processing or parallel execution of large datasets. To address this limitation, alternative approaches include:

   1. Adding an asyncronous job queue from a third-party, wherein worker services would read from the queue and perform long-running tasks. This would come at the cost of added complexity and cost to the system.

1. **Per-Seat Pricing**: Vercel's per-seat charge for organizations can create a disincentive for granting operational control to multiple individuals within the organization. This pricing approach may discourage widespread access and collaboration, as each additional user comes with an associated cost. Limiting operational control to a smaller number of individuals can hinder agility, impede efficient decision-making, and limit the ability to delegate responsibilities effectively.

### Costs

Estimated monthly costs [[5], [6]] (calculated in USD):

| Decription                              | Price          | Required     | Included    | Total            |
| --------------------------------------- | -------------- | ------------ | ----------- | ---------------- |
| Vercel Org Users                        | $20/user       |              | 1 user      | $20              |
| Serverless Function Execution           | $40/100 GB Hrs | <1000 GB Hrs | 1000 GB Hrs | $0               |
| Bandwidth                               | $40/100 GB Hrs | <1000 GB Hrs | 1000 GB Hrs | $0               |
| CI Build Executions                     | $40/100 GB Hrs | <1000 GB Hrs | 1000 GB Hrs | $0               |
| db - instances                          | $1/db          | 1            | 1           | $0               |
| db - compute time                       | $0.10/hr       | 360 hr       | 60 hrs      | $30              |
| db - storage                            | $0.30/GB       | 15 GB        | 512 MB      | $4.35            |
| db - written data                       | $0.10/GB       | 5 GB         | 512 MB      | $0.50            |
| db - data trasfer                       | $0.20/GB       | 10 GB        | 512 MB      | $2               |
| **Total anticipated operational costs** |                |              |             | $58.85 USD/month |

[1]: https://vercel.com/docs/storage/vercel-postgres/limits#vercel-postgres-cold-starts "Vercel Postgres: Cold Starts"
[2]: https://vercel.com/guides/how-to-allowlist-deployment-ip-address#allow-all-ip-addresses
[3]: https://www.timescale.com/legal/licenses
[4]: https://docs.timescale.com/about/latest/timescaledb-editions/
[5]: https://vercel.com/pricing "Vercel Pricing"
[6]: https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing#pricing "Vercel Postgres: Pricing"
