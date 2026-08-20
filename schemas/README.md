# OMSP TypeScript schemas

These TypeScript declarations are the normative OMSP v0.2 definitions for serialized property
names, types, requiredness, nullability, enumerations, and discriminated unions. Related models are
grouped by semantic domain.

Every property is required unless it has a `?` marker. A `null` union means the property is still
required and `null` represents unavailable or inapplicable data. Comments document local value and
collection constraints that TypeScript's type system cannot enforce.

| Module | Contents |
| --- | --- |
| [`input/shared-values.ts`](input/shared-values.ts) | Scalar aliases and quantity value types |
| [`input/master-data.ts`](input/master-data.ts) | Parts, Materials, Customers, Vendors, Employees, and Machines |
| [`input/customer-demand.ts`](input/customer-demand.ts) | Sales Orders and requested Parts, quantities, and dates |
| [`input/production.ts`](input/production.ts) | Jobs, Tasks, requirements, progress, and lifecycle statuses |
| [`input/resource-capacity.ts`](input/resource-capacity.ts) | Skills, Shifts, assignments, and availability exceptions |
| [`input/purchasing.ts`](input/purchasing.ts) | Material and external-processing purchase orders |
| [`output/fulfillment.ts`](output/fulfillment.ts) | Customer-order fulfillment status, allocations, ASNs, and forecast |
| [`output/health.ts`](output/health.ts) | Reusable health claims with source provenance and raw evidence |
| [`output/report-snapshots.ts`](output/report-snapshots.ts) | Report-safe Customer, Part, Machine, and Vendor snapshots |
| [`output/job-timelines.ts`](output/job-timelines.ts) | Embedded Jobs and production steps with placements and critical-path checkpoints |

The input modules contain scheduling inputs and observed execution state. They deliberately define
no generic `SchedulingInput` envelope. The output modules contain the self-contained customer-order
`FulfillmentForecast`, its Job-timeline records, and the report-safe snapshots embedded in those
records. Output declarations reuse input value types directly; there is no barrel module.

`FulfillmentForecast` is a domain-specific point-in-time result, not a generic solver result or
transport wrapper. OMSP does not define how input collections and output records are stored or
transmitted.

Records are serialized as plain JSON objects; consumers do not need a JavaScript or TypeScript
runtime. The exact process for deriving JSON Schema or other machine-readable validation artifacts
will be specified later.

TypeScript cannot enforce cross-record references, unit equality across referenced records,
chronological field ordering, collection-wide identifier uniqueness, or scheduling calculations.
Implementations must also conform to the normative
[OMSP Semantic Contract](../spec/omsp-specification.md).
