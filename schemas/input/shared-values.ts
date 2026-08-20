/**
 * Value types reused throughout the OMSP input and output contracts.
 *
 * Type aliases document constraints that TypeScript cannot enforce by itself.
 * Producers must also satisfy the rules in the OMSP Semantic Contract.
 */

// Text, dates, times, and URLs

/** String containing at least one character. */
export type NonEmptyString = string;

/** ISO 8601 calendar date in YYYY-MM-DD form. */
export type DateString = string;

/** RFC 3339 timestamp with Z or an explicit numeric UTC offset. */
export type DateTimeString = string;

/** Absolute HTTP(S) URL. */
export type HttpUrl = string;

/** Local 24-hour time in HH:mm form. */
export type LocalTimeString = string;

// Numbers

/** Finite number greater than or equal to zero. */
export type NonNegativeNumber = number;

/** Finite number greater than zero. */
export type PositiveNumber = number;

/** Integer greater than or equal to zero. */
export type NonNegativeInteger = number;

/** Integer from 1 (lowest) through 5 (highest). */
export type SkillPriority = number;

// Quantities

/** Non-negative quantity expressed in a non-empty canonical unit. */
export interface Quantity {
  value: NonNegativeNumber;
  unit: NonEmptyString;
}

/** Strictly positive quantity expressed in a non-empty canonical unit. */
export interface PositiveQuantity {
  value: PositiveNumber;
  unit: NonEmptyString;
}

/** Non-negative count of Parts. Countable Parts always use Each. */
export interface CountQuantity {
  value: NonNegativeNumber;
  unit: "Each";
}

/** Strictly positive count of Parts. Countable Parts always use Each. */
export interface PositiveCountQuantity {
  value: PositiveNumber;
  unit: "Each";
}
