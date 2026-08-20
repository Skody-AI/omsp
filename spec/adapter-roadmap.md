# Adapter Roadmap

Once OMSP reaches 1.0, the project plans to collaborate with ERP vendors, integrators,
manufacturing partners, and telemetry partners to publish functional adapters, starting with:

- ProShop
- Acumatica
- Fulcrum
- JobBOSS

Each adapter will:

- retrieve objects from its source system;
- store the original objects as raw files;
- transform the source objects into OMSP objects; and
- store the transformed OMSP objects as files.

An adapter may implement only the OMSP entities relevant to its source system. For example, a
telemetry adapter may use `Job` and `Task` without implementing the full scheduling model.

Source-system field and status mappings are implementation details within each adapter. Adapters
will be developed and reviewed with relevant partners before publication in this repository.

Adapters are implementation projects. OMSP conformance remains defined by the TypeScript
declarations and the [`OMSP Semantic Contract`](omsp-specification.md).
