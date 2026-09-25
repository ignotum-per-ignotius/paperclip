# Flow v2 Command Chain Smoke Test

## Objective

Prove that the Flow v2 organizational and execution substrate can carry one bounded intelligence task through delegation, execution, review, and QA without custom PaperClip server logic.

## Chain

CIO -> CIOA -> Analysis Chief -> Analyst -> Analysis Chief -> QA Chief -> CIO

## Test task

Use synthetic information only.

Board instruction:

> Determine whether the supplied synthetic reporting supports the assessment that Example Organization is preparing to change its operating posture. Separate evidence, assumptions, judgments, alternatives, and confidence.

## Required execution

1. Assign the board instruction to the CIO.
2. CIO creates or delegates a child task to CIOA with the mission objective and acceptance criteria.
3. CIOA delegates analytic responsibility to Analysis Chief.
4. Analysis Chief delegates the bounded analytic task to Analyst.
5. Analyst completes the work in an isolated workspace and posts the result with provenance.
6. Analysis Chief reviews the result for requirement satisfaction and analytic discipline.
7. QA Chief independently reviews the finished work against the acceptance criteria.
8. CIO receives the reviewed result and closes or redirects the mission task.

## Acceptance criteria

The test passes only if:

- every delegation creates a durable task relationship
- reporting lines remain intact
- the Analyst cannot bypass the Analysis Chief for normal dissemination
- the Analyst receives only explicitly assigned skills and authorized connections
- workspace creation succeeds
- execution produces durable activity/audit records
- source/provenance fields survive the handoffs
- failure of an agent run is classified and recoverable
- a blocked task can be escalated to the correct manager
- QA review remains independent of Analysis
- the CIO can see the complete task lineage and final disposition

## Failure injection

Repeat the chain with one controlled failure:

1. withhold a required connection or credential from the Analyst
2. confirm execution pauses or fails with the expected authorization/credential classification
3. grant the connection through the supported Flow/PaperClip mechanism
4. retry the task
5. confirm successful recovery without recreating the mission task

## Evidence to retain

- imported org tree
- task IDs and parent/child relationships
- assigned agent IDs
- skill snapshot
- connection grant state
- workspace ID
- execution/run IDs
- recovery event
- QA review
- final CIO disposition
- activity/audit entries
