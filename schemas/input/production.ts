/**
 * Production work and observed execution progress.
 *
 * A Job produces a Part and contains its ordered Tasks. A Job may fulfill one
 * SalesOrderItem by ID, while each Task carries its own resource, labor, and
 * material requirements.
 */

import type {
  CountQuantity,
  DateString,
  DateTimeString,
  HttpUrl,
  NonEmptyString,
  NonNegativeInteger,
  NonNegativeNumber,
  PositiveCountQuantity,
  Quantity,
} from "./shared-values";
import type { SkillType } from "./resource-capacity";

// Lifecycle states

export type JobStatus =
  | "Pending"
  | "Ready"
  | "InProgress"
  | "OnHold"
  | "Completed"
  | "Canceled";

export type TaskStatus =
  | "NotStarted"
  | "ReadyToRun"
  | "InProgress"
  | "FirstArticlePassed"
  | "Paused"
  | "Completed"
  | "Canceled";

// Task requirements

/** Discriminated union of raw-Material and component-Part demand. */
export type MaterialRequirement =
  | {
      kind: "Material";
      materialId: NonEmptyString;
      quantity: Quantity;
    }
  | {
      kind: "Part";
      partId: NonEmptyString;
      quantity: Quantity;
    };

/** Workforce skill needed during one Task phase. */
export interface TaskSkillRequirement {
  skillType: SkillType;
  /** Source priority, or null when no explicit priority is available. */
  priority: number | null;
}

// Route execution

/** One ordered production or external-processing step within a Job. */
export interface Task {
  // Identity and route order
  id: NonEmptyString;
  number: string | null;
  name: NonEmptyString;
  sequence: NonNegativeInteger;

  // Lifecycle and assigned resource
  status: TaskStatus;
  /** True when this step is performed by an external supplier. */
  isExternal: boolean;
  /**
   * Vendor performing this step. Required for external Tasks and null for
   * internal Tasks.
   */
  externalVendorId: NonEmptyString | null;
  machineId: NonEmptyString;

  // Planned work
  setupDurationMinutes: NonNegativeNumber;
  runDurationMinutes: NonNegativeNumber;
  /** Percentage from 0 through 100. */
  runLaborPercent: number;
  /** At most two entries, with no more than one per SkillType. */
  skillRequirements: TaskSkillRequirement[];
  totalMaterialRequirements: MaterialRequirement[];

  // Observed progress
  setupCompleted: boolean;
  completedQuantity: CountQuantity | null;
  actualStartDateTime: DateTimeString | null;
  actualEndDateTime: DateTimeString | null;
  statusUpdatedDateTime: DateTimeString | null;

  erpUrl: HttpUrl | null;
}

// Production order

/** Production order for a target quantity of one Part. */
export interface Job {
  // Identity and output
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  partId: NonEmptyString;
  quantity: PositiveCountQuantity;

  // Optional demand linkage
  salesOrderItemId: NonEmptyString | null;

  // Planning controls and lifecycle
  productionDueDate: DateString | null;
  earliestStartDateTime: DateTimeString | null;
  createdDateTime: DateTimeString | null;
  status: JobStatus;
  priority: NonNegativeNumber;

  erpUrl: HttpUrl | null;

  /** Tasks in nondecreasing sequence order. */
  tasks: Task[];
}
