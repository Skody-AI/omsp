/**
 * Stable reference records used by demand, production, and capacity models.
 *
 * IDs are integration identities. Human-facing names and numbers are not
 * substitutes for IDs.
 */

import type {
  CountQuantity,
  HttpUrl,
  NonEmptyString,
  Quantity,
} from "./shared-values";

// Items held in inventory

/** Countable finished or component item. */
export interface Part {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString | null;
  inventoryQuantity: CountQuantity;
  erpUrl: HttpUrl | null;
}

/** Raw stock measured in its own canonical unit. */
export interface Material {
  id: NonEmptyString;
  name: NonEmptyString;
  inventory: Quantity;
  erpUrl: HttpUrl | null;
}

// Trading parties

/** Organization placing Sales Orders. */
export interface Customer {
  id: NonEmptyString;
  name: NonEmptyString;
  erpUrl: HttpUrl | null;
}

/** Organization supplying purchased Materials, Parts, or external work. */
export interface Vendor {
  id: NonEmptyString;
  name: NonEmptyString;
  /** Single free-form supplier address; null when unavailable. */
  address: NonEmptyString | null;
  /** Postal code for the supplier location; null when unavailable. */
  postalCode: NonEmptyString | null;
  websiteUrl: HttpUrl | null;
}

// Capacity-bearing resources

/** Person who may provide setup or operation labor. */
export interface Employee {
  id: NonEmptyString;
  name: NonEmptyString;
  erpUrl: HttpUrl | null;
}

/** Physical or logical resource on which a Task can be scheduled. */
export interface Machine {
  id: NonEmptyString;
  name: NonEmptyString;
  erpUrl: HttpUrl | null;
}
