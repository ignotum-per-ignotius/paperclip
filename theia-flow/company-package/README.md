# Theia Flow Intelligence Command Package

This directory contains the portable initial organization for Flow v2.

It is intentionally separate from PaperClip core and uses the native `agentcompanies/v1` package model.

The hierarchy is:

- CIO
  - CIOA
    - Requirements Chief
    - Collection Chief
    - Processing Chief
    - Analysis Chief
    - Dissemination Chief
    - Operations and Effects Chief
  - Chief of Staff
  - QA Chief

This package is a validation asset first. It should be imported into an isolated Flow v2 company and exercised before it is treated as the default production organization.

The initial smoke test should verify:

1. organization import
2. reporting-line integrity
3. CIO delegation to CIOA
4. CIOA delegation to one division chief
5. division chief delegation to a subordinate agent created through Agent Studio
6. skill assignment
7. workspace creation
8. connection authorization
9. task execution
10. recovery and escalation
11. QA review
12. durable audit/activity records
