import Bexio from "bexio";
import { getToken } from "./config";

let client: Bexio | null = null;

export function getClient(): Bexio {
  if (!client) {
    client = new Bexio(getToken());
  }
  return client;
}
