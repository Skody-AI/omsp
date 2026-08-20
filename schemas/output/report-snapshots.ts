/**
 * Report-safe master-data snapshots embedded in OEM-facing output records.
 *
 * These values describe the records used by the producing calculation. They
 * intentionally omit internal navigation fields such as ERP URLs.
 */

import type { NonEmptyString } from "../input/shared-values";

/** Customer identity needed to read a fulfillment report without a lookup. */
export interface CustomerSnapshot {
  id: NonEmptyString;
  name: NonEmptyString;
}

/** Part identity needed to read an order line or production Job. */
export interface PartSnapshot {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString | null;
}

/** Machine identity needed to read a production-step placement. */
export interface MachineSnapshot {
  id: NonEmptyString;
  name: NonEmptyString;
}

/** External processor identity needed to read an outsourced production step. */
export interface VendorSnapshot {
  id: NonEmptyString;
  name: NonEmptyString;
  /** Single free-form supplier address; null when unavailable. */
  address: NonEmptyString | null;
  /** Postal code for the reported supplier location; null when unavailable. */
  postalCode: NonEmptyString | null;
}
