/**
 * Customer demand that production and inventory must fulfill.
 *
 * A SalesOrder contains its SalesOrderItems. Jobs link to individual items by
 * SalesOrderItem.id; the linkage is defined in production.ts.
 */

import type {
  DateString,
  DateTimeString,
  HttpUrl,
  NonEmptyString,
  NonNegativeInteger,
  PositiveCountQuantity,
} from "./shared-values";

/** One requested Part and quantity on a customer Sales Order. */
export interface SalesOrderItem {
  id: NonEmptyString;
  customerPurchaseOrderPositionNumber: NonNegativeInteger;
  partId: NonEmptyString;
  quantity: PositiveCountQuantity;
  /** Customer-requested ship date for this PO line. */
  requestedShipDate: DateString;
  /** Customer-requested delivery date used to evaluate fulfillment timing. */
  requestedDeliveryDate: DateString;
  /** Supplier's current committed ship date. */
  committedShipDate: DateString;
}

/** Customer order containing one or more independently fulfillable items. */
export interface SalesOrder {
  id: NonEmptyString;
  number: NonEmptyString;
  name: NonEmptyString;

  customerId: NonEmptyString;
  customerPurchaseOrderNumber: NonEmptyString;
  /** When the customer sent the purchase order represented by this Sales Order. */
  customerPurchaseOrderSentDateTime: DateTimeString;

  createdDateTime: DateTimeString | null;
  erpUrl: HttpUrl | null;

  items: SalesOrderItem[];
}
