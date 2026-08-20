/**
 * Evidence-bearing health claims reusable across OMSP output records.
 *
 * Declarations are ordered from the submitted assessment to its raw-data
 * representation. A label, score, or narrative without evidence is invalid.
 */

import type {
  DateTimeString,
  NonEmptyString,
} from "../input/shared-values";

/** Publisher health claim supported by one or more raw evidence records. */
export interface HealthAssessment {
  indicator: HealthIndicator;
  description: NonEmptyString | null;
  /** Non-empty array of records that materially support this claim. */
  evidence: HealthEvidence[];
}

/** Provenance and raw source values supporting a HealthAssessment. */
export interface HealthEvidence {
  /** Source system, dataset, or telemetry stream. */
  source: NonEmptyString;
  /** When the evidence was observed or retrieved from its authoritative source. */
  observedDateTime: DateTimeString;
  /** Non-empty object containing the exact source fields and values used. */
  rawData: RawDataObject;
}

export type HealthIndicator = "Green" | "Yellow" | "Red";

/** JSON object preserved as evidence without imposing source-specific fields. */
export interface RawDataObject {
  [field: string]: RawDataValue;
}

export type RawDataValue =
  | RawDataPrimitive
  | RawDataObject
  | RawDataValue[];

export type RawDataPrimitive = string | number | boolean | null;
