/**
 * Point-in-time forecast of customer Sales Order fulfillment.
 *
 * Declarations are ordered from the top-level output to supporting details:
 * forecast, Sales Order results, allocations, assessments, and status values.
 */

import type {
  CountQuantity,
  DateString,
  DateTimeString,
  NonEmptyString,
  NonNegativeInteger,
  PositiveCountQuantity,
} from "../input/shared-values";
import type { HealthAssessment } from "./health";
import type { JobTimeline } from "./job-timelines";
import type {
  CustomerSnapshot,
  PartSnapshot,
} from "./report-snapshots";

// Forecast snapshot

/** Complete customer-order forecast produced by one scheduling calculation. */
export interface FulfillmentForecast {
  id: NonEmptyString;
  /** Business identifier assigned to the reporting supplier by the customer. */
  supplierCode: NonEmptyString;
  /** Code assigned to the report recipient by the producing supplier. */
  customerCode: NonEmptyString;
  /** When this forecast was calculated. */
  generatedDateTime: DateTimeString;
  /** Snapshot time of the input data, when known. */
  sourceDataAsOfDateTime: DateTimeString | null;

  /** At least one unique Sales Order fulfillment. */
  salesOrders: SalesOrderFulfillment[];
  /** One unique timeline per referenced Job. */
  jobs: JobTimeline[];
  /** Unique shipment notices whose items reference Sales Order Items in this report. */
  advanceShippingNotices: AdvanceShippingNotice[];
}

// Sales Order and item results

/** Report-safe snapshot of the Sales Order used by the forecast. */
export interface SalesOrderSnapshot {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  /** An embedded Sales Order proves that the creation checkpoint is complete. */
  checkpointStatus: "Complete";
  customer: CustomerSnapshot;
  customerPurchaseOrderNumber: NonEmptyString;
  customerPurchaseOrderSentDateTime: DateTimeString;
  createdDateTime: DateTimeString | null;
}

/** Report-safe snapshot of one Sales Order Item and its requested Part. */
export interface SalesOrderItemSnapshot {
  id: NonEmptyString;
  customerPurchaseOrderPositionNumber: NonNegativeInteger;
  part: PartSnapshot;
  orderedQuantity: PositiveCountQuantity;
  requestedShipDate: DateString;
  requestedDeliveryDate: DateString;
  committedShipDate: DateString;
}

/** Self-contained fulfillment summary and item detail for one Sales Order. */
export interface SalesOrderFulfillment {
  salesOrder: SalesOrderSnapshot;
  fulfillmentStatus: FulfillmentStatus;
  /** At least one unique Sales Order Item fulfillment. */
  items: SalesOrderItemFulfillment[];
}

/** Fulfillment forecast carrying the Sales Order Item fields needed by a report. */
export interface SalesOrderItemFulfillment {
  salesOrderItem: SalesOrderItemSnapshot;
  fulfillmentStatus: FulfillmentStatus;
  healthAssessment: HealthAssessment | null;
  projectedFulfillmentDateTime: DateTimeString | null;
  projectedUnfulfilledQuantity: CountQuantity;
  /** Unique allocations contributing to this item. */
  allocations: FulfillmentAllocation[];
}

// Supply allocation

/** Current inventory or future Job supply allocated to an item. */
export type FulfillmentAllocation =
  | InventoryFulfillmentAllocation
  | JobFulfillmentAllocation;

/** Quantity fulfilled from current Part inventory. */
export interface InventoryFulfillmentAllocation {
  kind: "Inventory";
  quantity: PositiveCountQuantity;
}

/** Quantity fulfilled by the future output of one Job. */
export interface JobFulfillmentAllocation {
  kind: "Job";
  jobId: NonEmptyString;
  quantity: PositiveCountQuantity;
}

// Shipment notices

/** Shipment notice that may cover lines from one or more Sales Orders. */
export interface AdvanceShippingNotice {
  id: NonEmptyString;
  carrierName: NonEmptyString | null;
  trackingNumber: NonEmptyString | null;
  shipDate: DateString;
  estimatedArrivalDate: DateString | null;
  /** At least one item; Sales Order Item IDs are unique within this notice. */
  items: AdvanceShippingNoticeItem[];
}

/** Quantity of one embedded Sales Order Item included in a shipment notice. */
export interface AdvanceShippingNoticeItem {
  salesOrderItemId: NonEmptyString;
  quantity: PositiveCountQuantity;
}

// Status values

export type FulfillmentStatus =
  | "OnTime"
  | "Late"
  | "InsufficientSupply"
  | "Unknown";
