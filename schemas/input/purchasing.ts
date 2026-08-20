/**
 * Purchase Orders that provide future material, component-Part, or
 * external-processing supply.
 *
 * Receipt progress is recorded per line because one Purchase Order may cover
 * multiple referenced Materials, Parts, or Tasks.
 */

import type {
  CountQuantity,
  DateString,
  DateTimeString,
  HttpUrl,
  NonEmptyString,
  PositiveCountQuantity,
  PositiveQuantity,
  Quantity,
} from "./shared-values";

/** Receipt lifecycle shared by all Purchase Order line items. */
export type PurchaseOrderItemStatus =
  | "NotReceived"
  | "PartiallyReceived"
  | "Received"
  | "Canceled";

// External processing

/** Purchased output of one external Task. */
export interface ExternalTaskPurchaseOrderItem {
  lineItemNumber: string | null;
  taskId: NonEmptyString;
  status: PurchaseOrderItemStatus;
  quantity: PositiveCountQuantity;
  addedToInventoryQuantity: CountQuantity | null;
  dueDate: DateString | null;
  estimatedArrivalDateTime: DateTimeString | null;
}

/** Purchase Order containing one or more external-Task lines. */
export interface ExternalTaskPurchaseOrder {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  /** Vendor performing every external Task referenced by this order. */
  vendorId: NonEmptyString;
  erpUrl: HttpUrl | null;
  /** At least one item. */
  items: ExternalTaskPurchaseOrderItem[];
}

// Material and component-Part supply

/** Fields shared by raw-Material and component-Part Purchase Order lines. */
interface MaterialPurchaseOrderItemBase {
  lineItemNumber: string | null;
  status: PurchaseOrderItemStatus;
  dueDate: DateString | null;
  estimatedArrivalDateTime: DateTimeString | null;
}

/** Purchase Order line supplying raw Material. */
export interface MaterialPurchaseOrderMaterialItem
  extends MaterialPurchaseOrderItemBase {
  kind: "Material";
  materialId: NonEmptyString;
  quantity: PositiveQuantity;
  addedToInventoryQuantity: Quantity | null;
}

/** Purchase Order line supplying countable component Parts. */
export interface MaterialPurchaseOrderPartItem
  extends MaterialPurchaseOrderItemBase {
  kind: "Part";
  partId: NonEmptyString;
  quantity: PositiveCountQuantity;
  addedToInventoryQuantity: CountQuantity | null;
}

/** Discriminated union of raw-Material and component-Part supply lines. */
export type MaterialPurchaseOrderItem =
  | MaterialPurchaseOrderMaterialItem
  | MaterialPurchaseOrderPartItem;

/** Purchase Order containing one or more Material or Part supply lines. */
export interface MaterialPurchaseOrder {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;
  vendorId: NonEmptyString | null;
  erpUrl: HttpUrl | null;
  /** At least one item. */
  items: MaterialPurchaseOrderItem[];
}
