# OMSP — Open Manufacturing Scheduling Protocol

**A vendor-neutral, ERP-independent data specification for production scheduling and supply-chain
visibility.**

OMSP defines a shared operational model for planning production and communicating its progress.
Scheduling systems use it to generate, validate, and adapt schedules. Manufacturers, suppliers,
and customers can use the same `SalesOrder`, `Job`, and `Task` context to exchange production
commitments, status, quantities, dates, and execution progress across organizational boundaries.

## Why OMSP exists

Most layers of the manufacturing data stack are served by open standards — STEP AP242 for product
definition, MTConnect for machine telemetry, and ISA-95/IEC 62264 for the enterprise-to-operations
boundary. Manufacturers still lack a broadly adopted, scheduler-ready model that connects demand,
production work, resources, materials, and execution progress.

The result is bespoke integration inside the factory and fragmented communication across the supply
chain.

OMSP fills that gap. It is a **minimum-but-sufficient production context model derived empirically
from production deployments**. Every entity earned its place by being necessary to plan or track
real production, and fields were excluded when they proved unnecessary.

## Core scenarios

### Production scheduling

Scheduling systems use a consistent view of demand, production work, resources, calendars,
workforce skills, material readiness, and execution feedback to create and adapt feasible schedules
across heterogeneous manufacturing environments.

### Production-aware telemetry

Machine-monitoring and telemetry systems associate shop-floor data with `Job` and `Task` context.
By integrating telemetry with the production schedule, they know what work is expected to run, on
which resource, and when. They can distinguish a planned stop, setup, or idle period from a
production issue—for example, a Task that did not start on time, is running longer than planned, or
is executing on the wrong Machine—and alert early enough for the shop to respond before downstream
commitments are affected. This schedule-aware baseline reduces both false positives and missed
alerts.

The same result is difficult to achieve when planning is manual or when telemetry rules must be
configured and updated by hand. Static thresholds quickly become stale as priorities, resource
assignments, and start times change. With shared OMSP entities, monitoring systems can consume only
the production context relevant to their integration and keep alerting aligned with the current
schedule without implementing the full scheduling model.

### Customer–supplier coordination

Suppliers share production commitments and progress using the same `SalesOrder`, `Job`, and `Task`
semantics their customers use. Both sides gain a shared view of what is being made, how far it has
progressed, and when it is expected—reducing calls, email threads, spreadsheets, and recurring
status meetings. Each fulfillment report carries the supplier-assigned code for its customer,
while external Tasks identify the Vendor performing each outsourced operation.

## What's in this repository

| Path                                                       | Contents                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| [`spec/omsp-specification.md`](spec/omsp-specification.md) | Normative OMSP v0.2 semantics and conformance rules          |
| [`spec/adapter-roadmap.md`](spec/adapter-roadmap.md)       | Roadmap for functional source-system adapters after OMSP 1.0 |
| [`schemas/input/`](schemas/input/)                         | Scheduling-input and execution-state TypeScript declarations |
| [`schemas/output/`](schemas/output/)                       | Customer-order fulfillment TypeScript declarations           |
| [`GOVERNANCE.md`](GOVERNANCE.md)                           | How specification decisions are made                         |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                       | How to participate — issues, RFCs, and adapter feedback      |
| [`SECURITY.md`](SECURITY.md)                               | Security policy and vulnerability disclosure                 |

## Scope

OMSP's TypeScript declarations define serialized names, types, requiredness, nullability, unions,
and documented object-local constraints. The semantic contract defines cross-record relationships
and business meaning. Records are plain JSON objects; TypeScript is the readable notation for the
wire contract, not a required runtime. OMSP is deliberately transport-agnostic and
implementation-agnostic: extraction and transformation behavior, storage, transport (REST, OPC
UA, MQTT, files), migration, and testing belong to implementations, not to this specification.

The v0.2 entity set covers:

- **Basic entities** — `Part`, `Customer`, `Vendor`, `Employee`, `Machine`, `Material`
- **Sales-order demand** — `SalesOrder`, `SalesOrderItem`, customer PO identity and sent time,
  requested ship and delivery dates, and supplier ship commitment
- **Production work** — `Job`, `Task`, with status models and skill requirements
- **Shared values** — `Quantity`, `DayOfWeek`, and receipt-oriented `PurchaseOrderItemStatus`
- **External processing** — `ExternalTaskPurchaseOrder`, line-level Task references, vendor relationships, and receipt progress
- **Resource scheduling** — employee-machine skill matrix, `Shift`, shift windows, time-off calendars
- **Material planning** — raw-Material and component-Part requirements, purchase-order supply, and receipt progress
- **Fulfillment output** — embedded customer Sales Orders and line details, inventory and Job
  allocations, shipment-level ASNs, supplier and customer report codes, evidence-backed health
  assessments, and self-contained Job production-step timelines with required placements,
  checkpoint status, and critical-path Task Due checkpoints

## Relationship to existing standards

OMSP is **complementary** to, not competing with, existing manufacturing standards:

- **ISA-95 / IEC 62264 / B2MML** define the architectural boundary and high-level exchange between enterprise and operations. OMSP defines the scheduler-specific data contract that ISA-95 intentionally leaves abstract.
- **MTConnect / OPC UA** stream machine state. OMSP defines the planning context that machine state must be aligned to. A future OPC UA companion specification is a natural integration path.
- **MESA models** define MES functions. OMSP defines the data contract for the scheduling function.

## Status

OMSP is at **v0.2** — a draft release under active community review. This release synchronizes the
public input contract with the current production-derived canonical model and introduces a focused
fulfillment output for customer–supplier coordination. The open specification and its community
are new; feedback is not just welcome, it is the point.

**We are actively seeking reviewers** for specific layers of the specification:

- ERP planning inputs (jobs, routings, BOMs, calendars) — ERP vendor perspective
- Execution events and status semantics — MES perspective
- Telemetry linkage requirements — machine monitoring perspective
- Overall entity semantics — manufacturer / end-user perspective

Open an [issue](../../issues) or see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The OMSP specification and all schema declarations are licensed under [Apache License 2.0](LICENSE), which includes an express patent grant. Anyone may implement OMSP without permission, fees, or use of any originating vendor's products.

## Provenance

OMSP was extracted and published as an open specification by [Skody AI Inc.](https://skody.ai), whose production scheduler is one consumer of the model. Skody's stated intent is for OMSP governance to move to an independent, multi-stakeholder structure — see [GOVERNANCE.md](GOVERNANCE.md).
