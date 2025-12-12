import { DataSource } from "typeorm";
import { appConfig } from "./app.config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:root@localhost:5432/medigo",
  entities: ["src/common/database/enity/*.entity{.ts,.js}"],
  migrations: ["src/migration/*{.ts,.js}"],
  synchronize: false,
});
