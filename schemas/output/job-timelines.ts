/**
 * Self-contained scheduled placement and critical-path output for Jobs and
 * their Tasks. Each scheduled Task represents one production step.
 *
 * Declarations are ordered from the Job-level result to its scheduled-Task details.
 * Report-safe input values are embedded alongside their stable identities.
 */

import type {
  CountQuantity,
  DateString,
  DateTimeString,
  NonEmptyString,
  NonNegativeInteger,
  NonNegativeNumber,
  PositiveCountQuantity,
} from "../input/shared-values";
import type {
  JobStatus,
  TaskStatus,
} from "../input/production";
import type {
  MachineSnapshot,
  PartSnapshot,
  VendorSnapshot,
} from "./report-snapshots";

// Job-level result

/** OEM checkpoint lifecycle derived from detailed OMSP execution status. */
export type CheckpointStatus = "Planned" | "In Work" | "Complete";

/** Report-safe snapshot of the production Job used by the forecast. */
export interface JobSnapshot {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  part: PartSnapshot;
  targetQuantity: PositiveCountQuantity;
  /** Embedded Sales Order Item ID to which this Job contributes. */
  salesOrderItemId: NonEmptyString;
  productionDueDate: DateString | null;
  earliestStartDateTime: DateTimeString | null;
  /** Planned interval reported for the production order. */
  plannedStartDateTime: DateTimeString;
  plannedCompletionDateTime: DateTimeString;
  createdDateTime: DateTimeString;
  status: JobStatus;
  /** An embedded production order proves that its creation checkpoint is complete. */
  checkpointStatus: "Complete";
}

/** Inventory timing and ordered production-step timeline for one Job. */
export interface JobTimeline {
  job: JobSnapshot;
  /** When the Job output must enter inventory to support allocated demand. */
  requiredInventoryDateTime: DateTimeString | null;
  /** When the schedule projects the Job output will enter inventory. */
  projectedInventoryDateTime: DateTimeString | null;
  /** At least one scheduled Task per evaluated production step, in Job route order. */
  scheduledTasks: ScheduledTask[];
}

// Task-level result

/** Why a Vendor is shown for a scheduled Task. */
export type TaskVendorRole = "ExternalOperation" | "Material";

/** Vendor providing the external operation or outstanding material supply. */
export interface TaskVendorSnapshot {
  role: TaskVendorRole;
  vendor: VendorSnapshot;
}

/** Current Task details needed to render one scheduled production step. */
export interface TaskSnapshot {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  sequence: NonNegativeInteger;
  status: TaskStatus;
  checkpointStatus: CheckpointStatus;

  machine: MachineSnapshot;
  /** True when a Vendor performs this Task rather than an internal resource. */
  isExternal: boolean;
  /** Unique role-and-Vendor pairs relevant to this Task. */
  vendors: TaskVendorSnapshot[];

  /** True when unavailable material currently prevents this Task from starting. */
  isWaitingOnMaterial: boolean;
  /** Forecast time when every blocking material will be ready; null when not known or not waiting. */
  materialReadyDateTime: DateTimeString | null;

  /** Job target quantity processed by this step. */
  targetQuantity: PositiveCountQuantity;
  completedQuantity: CountQuantity;

  /** Setup plus run duration for the full target quantity. */
  plannedDurationMinutes: NonNegativeNumber;
  completedDurationMinutes: NonNegativeNumber;
  /** Planned duration less credited completed duration, floored at zero. */
  remainingDurationMinutes: NonNegativeNumber;

  actualStartDateTime: DateTimeString | null;
  actualEndDateTime: DateTimeString | null;
  statusUpdatedDateTime: DateTimeString;
}

/** One scheduled Task with its production-step state and schedule result. */
export interface ScheduledTask {
  task: TaskSnapshot;
  /** Required planned placement reported to the customer. */
  placement: TaskPlacement;
  /** Null when no trustworthy critical-path checkpoint is available. */
  criticalPath: TaskCriticalPath | null;
}

/** Selected Machine and scheduled interval for one Task. */
export interface TaskPlacement {
  machine: MachineSnapshot;
  startDateTime: DateTimeString;
  endDateTime: DateTimeString;
}

/** Latest feasible Task interval calculated by the backward pass. */
export interface TaskCriticalPath {
  latestStartDateTime: DateTimeString;
  /** Task Due: the latest feasible Task end. */
  latestEndDateTime: DateTimeString;
}
