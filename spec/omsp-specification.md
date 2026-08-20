# OMSP Semantic Contract

**Open Manufacturing Scheduling Protocol — v0.2**

Status: Draft
License: Apache 2.0

## 1. Contract

OMSP defines a language-neutral and transport-neutral planning model for production scheduling.
The normative contract has two coordinated parts:

1. The TypeScript declarations in [`schemas/input/`](../schemas/input/) and
   [`schemas/output/`](../schemas/output/) define serialized property names, named types,
   requiredness, nullability, enumerations, unions, and documented object-local constraints.
2. This document defines meanings and cross-record rules that TypeScript cannot express.

TypeScript is the readable notation for the wire contract. OMSP records are plain JSON objects and
do not depend on JavaScript classes, prototypes, or a TypeScript runtime. Every declared property
is required unless marked optional with `?`; a union with `null` means the property is required but
may contain `null`. A disagreement between the declarations and this document is a specification
defect; implementations MUST NOT silently choose one meaning.

[`adapter-roadmap.md`](adapter-roadmap.md) is informative. Extraction, transformation, storage,
transport, and optimization policy are implementation concerns unless this document explicitly
says otherwise. OMSP does not define a generic scheduling-input dataset or transport envelope.
`FulfillmentForecast` is a domain-specific output record, not a transport wrapper.

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** state requirement, prohibition,
recommendation, and permission respectively.

### Conformance

An OMSP producer conforms to v0.2 when every emitted record:

- structurally conforms to its exported TypeScript type and the local constraints documented with
  that declaration; and
- satisfies the applicable cross-record and semantic rules in this document.

An OMSP consumer conforms when it accepts conforming v0.2 records and interprets them according to
this document. A transport may carry any subset of input entity collections, but every reference
needed to interpret an input or output payload MUST be resolvable in the supplied context. An input
exchange profile MUST provide the record-snapshot time. Every exchange MUST provide the schedule
time zone outside OMSP records when it is needed for interpretation.

## 2. Model overview

| Area                    | Types                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master data             | `Part`, `Customer`, `Vendor`, `Employee`, `Machine`, `Material`                                                                                                             |
| Customer demand         | `SalesOrder`, `SalesOrderItem`                                                                                                                                              |
| Production              | `Job`, `Task`, `JobStatus`, `TaskStatus`, `TaskSkillRequirement`                                                                                                            |
| External processing     | `ExternalTaskPurchaseOrder`, `ExternalTaskPurchaseOrderItem`                                                                                                                |
| Workforce and calendars | `EmployeeMachineSkill`, applicability and scope types, `Shift`, `ShiftWindow`, assignments, employee and machine time off                                                   |
| Material supply         | `MaterialRequirement`, `MaterialPurchaseOrder`, `MaterialPurchaseOrderItem`                                                                                                 |
| Shared values           | `Quantity`, `PurchaseOrderItemStatus`, `SkillType`, `DayOfWeek`                                                                                                             |
| Health evidence         | `HealthAssessment`, `HealthEvidence`, `HealthIndicator`, raw JSON values                                                                                                    |
| Fulfillment output      | `FulfillmentForecast`, embedded report snapshots, Sales Order and item fulfillment, allocations, `JobTimeline`, and production-step placement and critical-path checkpoints |

`Job` and `Task` are real production instructions and execution steps, not reusable routing or BOM
templates. `Machine` is the capacity-bearing resource at the level the scheduler plans; it MAY be
a physical machine, interchangeable pool, department, or logical outside-processing resource.
`Material` identifies stock that is interchangeable without a substitution decision. `Part`
identifies countable finished or component items.

## 3. Common conventions

### Identity and references

- An `id` is a stable implementation identifier, not a display number. It MUST be unique within
  its entity type in the supplied context.
- Every non-null `...Id` MUST resolve to exactly one record of the referenced type. Nested entities
  such as `SalesOrderItem` and `Task` are referenced by their own IDs.
- A nullable relationship uses `null` only with the field-specific meaning defined by this
  contract, such as an unknown vendor or genuinely unlinked production. A producer MUST preserve a
  known relationship even when its target travels separately. Nullable properties remain required
  by the declarations and MUST NOT be omitted.
- Human-facing numbers and line numbers are not identities and need not be globally unique.

### Quantities and units

`Quantity` is a non-negative value and a non-empty canonical unit. Positive quantity declarations
require values greater than zero where zero would not represent demand or supply. Countable `Part`
quantities use `Each`.

Quantities connected by one relationship MUST use compatible units:

- `Job.quantity`, `Task.completedQuantity`, `SalesOrderItem.quantity`, and component-Part demand or
  supply use the referenced Part's `inventoryQuantity.unit`.
- raw-Material demand and supply use the referenced Material's `inventory.unit`.
- a purchase-order line's `addedToInventoryQuantity`, when present, uses the line's ordered unit.

OMSP does not define unit conversion. A producer MUST normalize compatible source units before
emitting records. Unit strings are exact, case-sensitive identifiers agreed by the exchange
profile. Both inventory fields are measured at the exchange's snapshot time.
`Part.inventoryQuantity` is physical stock on hand and may include reserved or allocated stock, so
a consumer MUST NOT assume the full value is unallocated. `Material.inventory` is pooled stock
available to scheduling. Reservations, locations, lots, and stock geometry are not represented
separately; a profile or consuming policy determines how reserved Part stock is treated.

### Dates, times, and URLs

- A `date` is an ISO 8601 calendar date (`YYYY-MM-DD`) and has no implied time of day.
- A `date-time` is an RFC 3339 timestamp ending in `Z` or an explicit numeric UTC offset.
- Shift window times are local `HH:mm` values in the time zone governing the schedule.
- `erpUrl` is an absolute HTTP(S) browser URL for a source record, never an API endpoint.
  `Vendor.websiteUrl` is the vendor's public website rather than an ERP record URL.
- `Vendor.address` is one free-form display line rather than a structured postal address.
  `Vendor.postalCode` is stored separately so integrations can identify the reported location when
  a fully structured address is unavailable. Either value is null when it cannot be supplied
  faithfully.

### Health claims and evidence

Any OMSP health claim MUST use `HealthAssessment` and MUST include at least one `HealthEvidence`
record, regardless of whether its indicator is Green, Yellow, or Red. `HealthEvidence.source`
identifies the source system, dataset, or telemetry stream. `observedDateTime` records when the
evidence was observed or retrieved from its authoritative source.

`HealthEvidence.rawData` MUST be a non-empty JSON object containing the actual source fields and
values that materially support the submitted claim. A derived label, score, summary, or narrative
alone is not evidence. Derived values MAY be included only when the underlying observations needed
to evaluate them are also present. Raw values MAY be converted to their faithful JSON
representation but MUST NOT be altered to strengthen or conceal the claim.

When the containing output has a `generatedDateTime`, evidence MUST NOT have an
`observedDateTime` after it. Producers MUST include only evidence needed to support the claim and
MUST exclude credentials, access tokens, unrelated personal data, and unrelated proprietary data.
These rules apply to fulfillment health and to every other OMSP record that uses
`HealthAssessment`.

### Strict records and extensions

OMSP records are closed by the contract. Producers MUST NOT add implementation-specific fields to
an OMSP object. Extensions MAY be carried in a transport wrapper or sidecar whose boundary from the
OMSP record is explicit.

## 4. Relationships and containment

```text
Customer <- SalesOrder --contains--> SalesOrderItem -> Part
                                      ^
                                      |
Part <- Job --------------------------+
        `--contains--> Task -> Machine
                         |--> externalVendorId -> Vendor
                         |--> MaterialRequirement -> Material | Part

Vendor <- ExternalTaskPurchaseOrder --contains--> item -> external Task
Vendor <- MaterialPurchaseOrder -----contains--> item -> Material | Part

Employee -- EmployeeMachineSkill --> Machine
Employee -- EmployeeShiftAssignment --> Shift --contains--> ShiftWindow
Employee -- EmployeeTimeOff          Machine -- MachineTimeOff

FulfillmentForecast --contains--> SalesOrderFulfillment --> SalesOrderSnapshot
        |                         `--contains--> SalesOrderItemFulfillment
        |                                           `--> SalesOrderItemSnapshot --> PartSnapshot
        |--contains--> JobTimeline --> JobSnapshot --> PartSnapshot
        |                     `--> ScheduledTask --> TaskSnapshot --> MachineSnapshot
        |                                                   `--> TaskVendorSnapshot --> VendorSnapshot
        `--contains--> AdvanceShippingNotice --> AdvanceShippingNoticeItem
                                                    `--> SalesOrderItemSnapshot
```

The following constraints apply across records:

- `SalesOrder.customerId` references the customer whose demand the order represents.
- A `Job` produces exactly one `Part`. If `salesOrderItemId` is non-null, that item's `partId` MUST
  equal the Job's `partId`. Multiple Jobs MAY fulfill one Sales Order Item; a null relationship
  represents build-to-inventory or otherwise unlinked production.
- Task ownership is expressed only by containment in `Job.tasks`. A Task MUST occur in exactly one
  Job in the supplied context.
- `Task.isExternal` is the authoritative marker for external processing. An external Task MUST
  have a non-null `externalVendorId` that resolves to the Vendor performing the operation. An
  internal Task MUST have `externalVendorId: null`.
- Task order is determined by `sequence`: every lower sequence precedes every higher sequence.
  Tasks sharing a sequence MAY execute in parallel.
- At most one `EmployeeMachineSkill` exists for an employee, machine, and skill-type tuple. At most
  one `EmployeeShiftAssignment` exists for an employee.
- A purchase-order source line remains a distinct item even when another line has the same
  reference, quantity, and dates.

## 5. Demand, production, and progress

`SalesOrderItem.requestedShipDate` and `requestedDeliveryDate` are the customer-requested dates for
the purchase-order line. `committedShipDate` is the supplier's current promise and is not a
forecast calculated from the production schedule. Shipment notices are fulfillment output rather
than Sales Order Item properties. `Job.productionDueDate` is the internal production-completion
deadline; it is not interchangeable with any of those customer-order dates.

`SalesOrder.number` is the manufacturer's Sales Order number, while the required
`customerPurchaseOrderNumber` is supplied by the customer.
`customerPurchaseOrderSentDateTime` records when the customer sent that purchase order.
`customerPurchaseOrderPositionNumber` is the required non-negative integer line position used by
the customer. `SalesOrder.createdDateTime` and `Job.createdDateTime` record creation in the source
system; `Job.earliestStartDateTime` is an inclusive production-start floor. Higher `Job.priority`
values take precedence over lower values, and zero means no elevated priority.

All Jobs present in a planning context are included records. Status conveys their lifecycle:

| Job status   | Meaning                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| `Pending`    | Not released for production.                                              |
| `Ready`      | Released but not started; it does not guarantee every Task is executable. |
| `InProgress` | Production has started.                                                   |
| `OnHold`     | Production is intentionally paused or blocked.                            |
| `Completed`  | The production instruction is complete.                                   |
| `Canceled`   | The production instruction will not proceed.                              |

Task status conveys execution state:

| Task status          | Meaning                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `NotStarted`         | Execution has not started and the run checkpoint has not been confirmed.                                          |
| `ReadyToRun`         | The source confirms the run may begin; material, predecessor, machine, and employee availability are not implied. |
| `InProgress`         | Execution has started and is progressing.                                                                         |
| `FirstArticlePassed` | One takt was completed and accepted; the full Task is not necessarily complete.                                   |
| `Paused`             | Execution started but is temporarily not progressing.                                                             |
| `Completed`          | The execution step is complete.                                                                                   |
| `Canceled`           | The execution step will not proceed.                                                                              |

Completed and canceled Tasks do not create current capacity or material demand, although their
records retain history.

`Job.quantity` is the positive target output. `runDurationMinutes` is the total planned run time
for that target, not a per-unit duration; for an external Task it is the normalized expected
external-processing duration. Total planned Task duration is
`setupDurationMinutes + runDurationMinutes`; remaining credited duration is never less than zero
after subtracting `completedDurationMinutes`. `setupCompleted` is true when setup is complete or no
setup is needed. A null completed quantity means trustworthy quantity progress is unavailable.

`Task.actualStartDateTime` and `Task.actualEndDateTime` are observed execution facts rather than
scheduled times. They are null when the source does not expose a trustworthy timestamp. A non-null
actual end MUST NOT precede a non-null actual start. `Task.statusUpdatedDateTime` records when the
source last changed or confirmed the emitted Task status; it is null when that time is unavailable.
It is distinct from the time an adapter retrieved the record and from the time a forecast was
generated.

`runLaborPercent` is the share of one employee's capacity required during the run phase; zero is
unattended. A `Setup` skill applies during setup. An `Operation` skill applies during attended run
time. At most one Task skill requirement exists per `SkillType`; absence of an entry means that
phase has no skill requirement. A non-null
`TaskSkillRequirement.priority` is a finite numeric priority associated with the requirement; null
means no explicit priority. It is not a minimum employee priority. OMSP v0.2 does not define its
ordering, scheduling effect, or direct comparison with `EmployeeMachineSkill.priority`.

An external Task does not consume in-house production capacity. Its `externalVendorId` identifies
the supplier performing the operation. Each `ExternalTaskPurchaseOrder.vendorId` MUST resolve to
that same Vendor, and every `ExternalTaskPurchaseOrderItem.taskId` MUST reference a Task with
`isExternal: true` and the matching `externalVendorId`. The item's quantity unit MUST match the
containing Job's output unit. One purchase order MAY cover several Tasks performed by the same
Vendor, and one Task MAY be covered by several lines.

Scheduled times, future resource assignments, critical-path checkpoints, setup selection,
feasibility, and relative date or planning-inclusion labels are not OMSP input properties.
The fulfillment-focused schedule results defined by OMSP are represented by the output types in
Section 8.

## 6. Workforce and calendars

The absence of an `EmployeeMachineSkill` means the employee is not qualified for that machine and
skill type. `EmployeeMachineSkill.priority` is an integer from `1` (lowest) through `5` (highest).
A higher value gives that employee higher assignment preference over an otherwise equivalent
employee for the same machine and skill type. Values for different machines or skill types are not
comparable.
Qualification requires the same `skillType` and a `machineId` equal to `Task.machineId`, including
when that Machine is logical, and the skill's applicability restrictions MUST match.
`applicability: null` means the skill has no customer or Material restriction.

When applicability is present:

1. Determine the Job's customer through `Job.salesOrderItemId`, its containing Sales Order, and
   `SalesOrder.customerId`. Unlinked production has no identified customer.
2. Determine the Job's Material set from Material-kind requirements on every Task in that Job.
3. An excluded customer or any excluded Material rejects the skill. Exclusions take precedence.
4. If `scopes` is null, the skill applies after exclusions. Otherwise at least one scope MUST
   match. Scopes are alternatives; within a scope, customer and Material conditions both match.
   A null condition is a wildcard. A non-null Material list matches when the Job requires at least
   one listed Material.

A Shift supplies recurring employee availability. `ShiftWindow.daysOfWeek` names the local day on
which the window starts. Window starts are inclusive and ends are exclusive. Equal start and end
times are invalid; an earlier end time means the window ends the following day. Overlapping Shift
windows are treated as one interval.

Employee availability is the assigned Shift minus `EmployeeTimeOff`. `MachineTimeOff` removes the
Machine's capacity. Every time-off end MUST be later than its start, and overlapping time-off
records for the same resource are treated as one unavailable interval. A time-off reason has no
scheduling effect beyond unavailability; producers SHOULD use a non-sensitive operational label
rather than personal or medical detail.

## 7. Material demand and supply

`Task.totalMaterialRequirements` is the only OMSP material-demand collection. Each requirement is
the positive total input needed for the Task's full planned output, not remaining demand, actual
issues, reservations, scrap, or allocations. A requirement references either raw `Material` or a
component `Part`. For one Task, requirements with the same kind and referenced ID MUST be combined.

Material purchase-order items likewise reference either raw Material or component Part. Ordered
`quantity` is immutable as receipts occur. `addedToInventoryQuantity` is cumulative inventory
added so far and MAY exceed the ordered quantity; null means no trustworthy receipt quantity is
available.

`PurchaseOrderItemStatus` has the following receipt meaning for material and external-work lines:

| Status              | Meaning                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| `NotReceived`       | No quantity has been received.                                                      |
| `PartiallyReceived` | A positive amount was received, but the source does not consider the line complete. |
| `Received`          | The source considers the line fully received.                                       |
| `Canceled`          | The line or order was canceled or rejected and contributes no future supply.        |

Receipt status takes precedence when deriving future supply. `Canceled` and `Received` contribute
zero future supply. `NotReceived` contributes the full ordered quantity. For `PartiallyReceived`,
remaining inbound supply is `max(quantity - addedToInventoryQuantity, 0)` when receipt quantity is
known; otherwise the remaining amount is unknown. Received inventory is represented in current
inventory and MUST NOT also be counted as future purchase-order supply. For a non-canceled line
with future supply, `estimatedArrivalDateTime` is the preferred availability time; `dueDate` is the
fallback when only a calendar date is known. A line with neither value has undated future supply.

Component Part demand can be covered by current Part inventory (subject to any reservation policy),
matching Part purchase-order supply, or finished output from Jobs producing that Part. OMSP does
not prescribe allocation, reservation, optimization, or material-readiness policy. A
`FulfillmentForecast` reports the allocation selected by its producer without making that policy
normative.

## 8. Fulfillment output

OMSP v0.2 output provides a self-contained customer-order fulfillment report. It embeds the Sales
Order, item, Part, Job, production-step, Machine, and external Vendor values needed to read the
report without retrieving separate OMSP input records. It reports whether selected Sales Order
Items can be covered by current Part inventory and linked Jobs, when those Jobs must and are
forecast to add their output to inventory, and the scheduled and critical-path timeline of each
supplying Job. It is not a generic solver-result format.

### Forecast snapshot

`FulfillmentForecast.id` identifies one immutable forecast snapshot. A producer SHOULD issue a new
ID whenever it recalculates the forecast rather than modifying an already shared snapshot.
`supplierCode` is the non-empty business identifier assigned to the report-producing supplier by
the customer. For an OEM exchange profile this is the supplier code, such as a BEST code, expected
by that customer.
`customerCode` is the non-empty business code that the report-producing supplier assigned to the
customer receiving the forecast. It is carried directly on the report rather than added to the
supplier's general `Customer` master-data contract.
`generatedDateTime` is when the forecast was calculated. `sourceDataAsOfDateTime` is the producer's
declared observation cutoff for the source execution data reflected in the forecast; null means
that no trustworthy common cutoff is available. It does not assert that every source record was
individually updated at that time.

A forecast MUST contain at least one selected Sales Order, and every embedded
`SalesOrderSnapshot.customer` MUST identify the customer represented by `customerCode`. The code is
scoped to the producing supplier and need not be globally unique. A forecast MAY contain no Job
timelines when all selected demand is covered by current inventory or no Job supply is forecast.

Every source-backed field in an embedded snapshot MUST faithfully reproduce the corresponding
input value used by the forecast calculation as of `sourceDataAsOfDateTime`, or as of the
record-specific update time when no common cutoff is available. Calculated plan and checkpoint
fields MUST follow the derivation rules below. A snapshot keeps the input record's stable `id` so
allocations and other relationships can be traced within the report, but a consumer MUST NOT need
an external lookup to obtain its report-facing number, name, quantity, status, or date fields.
Internal navigation values such as `erpUrl` are intentionally not copied into output snapshots.

Every Job allocation MUST have exactly one corresponding `JobTimeline` whose embedded `job.id`
matches `JobFulfillmentAllocation.jobId`, and every Job timeline MUST be referenced by at least one
allocation in the same forecast. Embedded Sales Order, Sales Order Item, Job, and production-step
IDs MUST be unique within their respective report collections. Advance Shipping Notice IDs MUST be
unique within the forecast.

### Sales Order fulfillment

`SalesOrderFulfillment.salesOrder` embeds the order number, name, customer, required customer
purchase-order number, customer PO sent time, and Sales Order creation time used by the
calculation. Its Sales Order Creation `checkpointStatus` is always `Complete`, because an embedded
Sales Order proves that the source creation checkpoint has occurred. Each
`SalesOrderItemFulfillment.salesOrderItem` embeds the line identity, required numeric customer PO
position, requested Part number and name, ordered quantity, requested ship and delivery dates, and
committed ship date. A Sales Order fulfillment MUST contain one item result for every evaluated
item on that order, and each embedded item ID MUST belong to the embedded Sales Order.

`SalesOrderItemFulfillment.allocations` records positive quantities assigned from either current
inventory or the future output of a Job. A Job allocation's `jobId` MUST match the embedded ID of a
non-canceled Job whose `salesOrderItemId` equals the evaluated embedded item ID and whose embedded
Part ID equals the item's embedded Part ID. Multiple Jobs MAY supply one item.

Allocation quantities and `projectedUnfulfilledQuantity` use the embedded Sales Order Item's unit.
The sum of allocation quantities plus `projectedUnfulfilledQuantity` MUST equal
`salesOrderItem.orderedQuantity`. Inventory allocation across the forecast MUST respect the
producer's reservation policy and MUST NOT allocate the same stock more than once. Future Job
allocation MUST NOT count output already included in current Part inventory.

`projectedFulfillmentDateTime` is the time by which all allocated supply needed for the item is
forecast to be in finished-goods inventory. When any required Job has no dated completion forecast,
the value is null. For an item supplied entirely by current inventory, it is
`sourceDataAsOfDateTime` when that value is known and otherwise `generatedDateTime`.

`fulfillmentStatus` is objective forecast state:

| Status               | Meaning                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OnTime`             | No projected quantity is unfulfilled, the fulfillment time is known, and it falls on or before `requestedDeliveryDate` in the schedule time zone. |
| `Late`               | No projected quantity is unfulfilled, the fulfillment time is known, and it falls after `requestedDeliveryDate` in the schedule time zone.        |
| `InsufficientSupply` | `projectedUnfulfilledQuantity` is positive. This takes precedence over dated classifications.                                                     |
| `Unknown`            | No quantity is projected unfulfilled, but a trustworthy dated comparison cannot be made.                                                          |

A Sales Order's status is `InsufficientSupply` if any item has that status, otherwise `Late` if any
item is late, otherwise `Unknown` if any item is unknown, and otherwise `OnTime`.

### Advance Shipping Notices

`FulfillmentForecast.advanceShippingNotices` contains shipment-level ASN records rather than a
single ASN property on a Sales Order Item. An ASN MUST contain at least one item, and its
`salesOrderItemId` values MUST be unique within that ASN and resolve to embedded Sales Order Items
in the same forecast. Each ASN item quantity uses the referenced item's unit.

One ASN MAY contain items from multiple Sales Orders. One Sales Order Item MAY be included in
multiple ASNs, supporting split and partial shipments without duplicating the ASN record. A null
carrier, tracking number, or estimated arrival date means that value has not been assigned or
cannot be reported; `shipDate` is required.

`healthAssessment` is an optional publisher assessment for an item. It is separate from objective
fulfillment status so a currently on-time item may still be marked Yellow when the publisher knows
of a material risk. Every non-null assessment MUST satisfy the health-evidence rules in Section 3;
a claim without supporting raw data is not conforming. Exchange profiles MAY define criteria for
Green, Yellow, and Red. A non-null description SHOULD explain a Yellow or Red assessment without
exposing sensitive internal details.

### Job and scheduled-Task timeline

`JobTimeline.job` embeds the report-facing Job identity, Part, target quantity, linked Sales Order
Item ID, explicit planned start and completion timestamps, creation time, detailed lifecycle
status, and Production Order Creation checkpoint status. Job-level completed quantity is not
represented; `TaskSnapshot.completedQuantity` is the sole execution-quantity progress value. The
checkpoint status is always `Complete`, because an embedded Job proves that the source production
order has been created. `plannedStartDateTime` MUST equal the earliest production-step placement
start, and `plannedCompletionDateTime` MUST equal the latest production-step placement end.
`requiredInventoryDateTime` is the latest time the Job's remaining output must enter finished-goods
inventory to support its linked embedded Sales Order Item. It can be earlier than the item's
`requestedDeliveryDate` because the customer date can include shipping or other post-production
time. It is null when no trustworthy inventory deadline can be calculated.

`projectedInventoryDateTime` is when the schedule forecasts the Job's remaining output will enter
inventory. It is normally the end of the last incomplete scheduled Task. It is null when no
complete dated forecast is available. A completed or canceled Job MUST NOT be used as future Job
supply; completed output is represented by current Part inventory.

A `JobTimeline.scheduledTasks` MUST contain at least one `ScheduledTask` and one entry for each Task
evaluated and placed for that Job, in the same route order as `Job.tasks`. Every entry is a
scheduled Task; the referenced Task remains the production step. `ScheduledTask.task` embeds the
Task ID, number, name, sequence, status, Machine identity, supplier roles, material readiness,
quantities, duration progress, and observed execution timestamps. Its `targetQuantity` MUST equal
the containing embedded Job's target quantity. Its `plannedDurationMinutes` MUST equal the input
Task's setup duration plus run duration. `completedDurationMinutes` MUST equal the input Task's
credited completed duration, and `remainingDurationMinutes` MUST equal the planned duration minus
completed duration, floored at zero. `number`, `completedQuantity`, and `statusUpdatedDateTime` are
required in an OEM-facing report even though the corresponding scheduling-input values may be
unavailable. A producer MUST NOT include a Job or Task in this report when it cannot supply those
report values and a scheduled placement.

`checkpointStatus` uses the exact customer-facing values `Planned`, `In Work`, and `Complete`.
Detailed OMSP statuses map as follows:

| OMSP status                                                 | Checkpoint status |
| ----------------------------------------------------------- | ----------------- |
| Task `NotStarted`, Task `ReadyToRun`                        | `Planned`         |
| Task `InProgress`, Task `FirstArticlePassed`, Task `Paused` | `In Work`         |
| Task `Completed`                                            | `Complete`        |

Canceled Jobs cannot contribute a Job allocation. Canceled Tasks have no truthful representation
in the three-value production-step checkpoint status and MUST NOT be included in a customer
fulfillment report.

`TaskSnapshot.isExternal` MUST equal the input Task's value. An external Task MUST have exactly one
`TaskVendorSnapshot` with `role: "ExternalOperation"`; its Vendor MUST match the input Task's
`externalVendorId`. An internal Task MUST have no `ExternalOperation` Vendor entry.

A `TaskVendorSnapshot` with `role: "Material"` identifies a known Vendor providing outstanding
material or component-Part supply that the scheduled Task needs. Material Vendor entries MUST be
derived from matching `MaterialPurchaseOrder` items selected to cover the Task's outstanding
requirements. Role-and-Vendor pairs MUST be unique; the same Vendor MAY appear once for each role.

`isWaitingOnMaterial` is true when unavailable material currently prevents the Task from starting.
When it is true, `materialReadyDateTime` is the forecast time when every blocking requirement will
be ready, or null when no trustworthy time can be calculated. When it is false,
`materialReadyDateTime` MUST be null. Known Vendors responsible for blocking supply MUST be included
with the `Material` role; the collection MAY be empty when the source cannot identify a Vendor.

Every embedded Vendor includes its ID, name, single free-form address, and postal code.
`VendorSnapshot.address` and `postalCode` are independently null when the integration cannot provide
a trustworthy value; otherwise each is a non-empty display value for the reported supplier
location. They MUST equal the corresponding values from the referenced input `Vendor`.

The embedded input Machine identifies the resource on which the Task was planned. Every scheduled
Task has a `placement` containing the selected Machine and absolute planned start and end
timestamps. Those timestamps map directly to the checkpoint planned interval. The selected Machine
MAY be the Task's input Machine or a physical member selected from a logical input pool. The
placement end MUST NOT precede its start.

`criticalPath` contains shift-aware latest-start and latest-end checkpoints calculated backward
from the Job's required inventory deadline using remaining Task work, routing precedence, and the
applicable working calendars. `latestEndDateTime` is the **Task Due** value. The latest end MUST NOT
precede the latest start. Completed Tasks and Tasks for which no trustworthy checkpoint can be
calculated use null.

Task buffer or slack is the exact timestamp difference between `criticalPath.latestEndDateTime`
and `placement.endDateTime`: positive is ahead of the checkpoint and negative is late. It is
derived and MUST NOT be serialized separately. A consumer MUST use the full timestamps rather than
calendar-day buckets. The next Task's critical-path values are available from its own timeline
entry and MUST NOT be duplicated on the preceding Task.

## 9. Compatibility and data handling

OMSP follows semantic versioning. Before v1.0, a breaking structural or semantic change increments
the minor version; after v1.0 it increments the major version. Patch releases are
backward-compatible clarifications or corrections. Consumers MUST select declarations from a
specific OMSP release and MUST NOT silently interpret a record under a different major or pre-1.0
minor contract.

OMSP defines data meaning, not access control. Records can contain employee names, time-off data,
customer and vendor relationships, and internal ERP URLs. Producers and consumers MUST protect
these records according to their deployment's privacy and security requirements and SHOULD emit
only data needed for planning.

## Informative material

See [`adapter-roadmap.md`](adapter-roadmap.md) for planned functional adapters after OMSP 1.0.
