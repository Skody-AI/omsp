/**
 * Workforce qualifications and working-time availability.
 *
 * Skill records determine who can perform work on a Machine. Shifts and
 * time-off records determine when Employees and Machines are available.
 */

import type {
  DateTimeString,
  LocalTimeString,
  NonEmptyString,
  SkillPriority,
} from "./shared-values";

// Skills and applicability

/** Phase of a Task for which an Employee may be qualified. */
export type SkillType = "Setup" | "Operation";

/**
 * Optional positive scope for one skill.
 *
 * Null means that dimension does not restrict the scope. Non-null arrays are
 * non-empty and contain unique IDs.
 */
export interface EmployeeMachineSkillScope {
  customerIds: NonEmptyString[] | null;
  materialIds: NonEmptyString[] | null;
}

/**
 * Inclusion scopes and explicit exclusions for an Employee-Machine skill.
 *
 * Exclusions override matching scopes. A non-null scopes array is non-empty.
 */
export interface EmployeeMachineSkillApplicability {
  scopes: EmployeeMachineSkillScope[] | null;
  /** Unique Customer IDs. */
  excludedCustomerIds: NonEmptyString[];
  /** Unique Material IDs. */
  excludedMaterialIds: NonEmptyString[];
}

/** Employee qualification for one Machine and Task phase. */
export interface EmployeeMachineSkill {
  employeeId: NonEmptyString;
  machineId: NonEmptyString;
  skillType: SkillType;
  priority: SkillPriority;
  applicability: EmployeeMachineSkillApplicability | null;
}

// Recurring working calendars

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/** Repeating local-time interval on one or more unique days. */
export interface ShiftWindow {
  /** Non-empty array of unique days. */
  daysOfWeek: DayOfWeek[];
  startTime: LocalTimeString;
  endTime: LocalTimeString;
}

/** Named recurring work schedule containing at least one window. */
export interface Shift {
  id: NonEmptyString;
  name: NonEmptyString;
  windows: ShiftWindow[];
}

/** Assignment of one Employee to one recurring Shift. */
export interface EmployeeShiftAssignment {
  employeeId: NonEmptyString;
  shiftId: NonEmptyString;
}

// Availability exceptions

/** Absolute interval during which an Employee is unavailable. */
export interface EmployeeTimeOff {
  id: NonEmptyString;
  employeeId: NonEmptyString;
  reason: NonEmptyString;
  startDateTime: DateTimeString;
  endDateTime: DateTimeString;
}

/** Absolute interval during which a Machine is unavailable. */
export interface MachineTimeOff {
  id: NonEmptyString;
  machineId: NonEmptyString;
  reason: NonEmptyString;
  startDateTime: DateTimeString;
  endDateTime: DateTimeString;
}
