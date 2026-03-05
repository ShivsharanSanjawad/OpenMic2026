import { Registration } from "@prisma/client";
import Papa from "papaparse";

export function toJson(data: Registration[]) {
  return JSON.stringify(data, null, 2);
}

export function toCsv(data: Registration[]) {
  return Papa.unparse(
    data.map((item) => ({
      ...item,
      extraFields: item.extraFields ? JSON.stringify(item.extraFields) : "",
    })),
  );
}
