import type { DataService } from "./types";
import { mockService } from "./mock";
import { supabaseService } from "./supabase";

/**
 * The single import point for all data access in the app.
 *
 *   import { data } from "@/services";
 *   const products = await data.getProducts();
 *
 * Which backend is live is decided by VITE_DATA_SOURCE ("mock" | "supabase").
 * Components never know or care which one answers. Adding a custom Node/MERN
 * backend later means writing one more adapter and adding a case here — no
 * component changes. See src/services/types.ts for the contract.
 *
 * The Supabase adapter only creates its client on first use, so selecting
 * "mock" (the default) never requires any Supabase env vars to be present.
 */

const source = (import.meta.env.VITE_DATA_SOURCE ?? "mock").toLowerCase();

export const data: DataService =
  source === "supabase" ? supabaseService : mockService;

export * from "./types";
