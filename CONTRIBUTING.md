# Contributing to OMSP

Use an issue to report a missing concept, ambiguous rule, or source-system mapping problem. Include
a concrete manufacturing example and the OMSP entities involved when possible.

## Proposing changes

Normative changes require an RFC:

1. Open an issue titled `RFC: <short description>`.
2. Describe the problem, proposed wire or semantic change, and compatibility impact.
3. After discussion, submit a pull request that updates both the TypeScript declarations and the
   semantic contract when applicable.

Typos, formatting, and non-semantic clarifications may be submitted directly as pull requests.

## Pull requests

- Keep each pull request focused on one change.
- Add or update comments and normative rules with the affected declarations.
- Preserve unrelated work already present in the branch.
- Explain any breaking change and how producers and consumers should migrate.

## Conduct

Be professional and specific. Discuss the model and evidence, not the person proposing it.

Specification decisions follow [GOVERNANCE.md](GOVERNANCE.md).
