# Change 4 (CH04) Pattern Effects and Architecture Evolution

## 1. Overview of Design Pattern Collaborations

Change 4 introduces the **Strategy Pattern** for recommendation ranking and extends existing architectural patterns (Dependency Injection, Entity-Repository, and API Endpoint Factory) within Misskey.

| Pattern Name | Pattern Type | Instance Name | Status After CH04 | Description |
|---|---|---|---|---|
| **Strategy** | Behavioral | `recommendation-ranking-strategy` | **New** | Pluggable `RecommendationRankingStrategy` with `WeightedPersonalizedRankingStrategy` and `ChronologicalRankingStrategy` |
| **Strategy** | Behavioral | `link-reputation-provider` | Maintained | CH03 Link reputation provider strategies (`LocalListReputationProvider`, `MockReputationProvider`, `DisabledReputationProvider`) |
| **Strategy** | Behavioral | `audio-transcription-provider` | Maintained | CH02 Audio speech-to-text provider strategies (`MockTranscriptionProvider`, `WhisperCliTranscriptionProvider`, `ExternalHttpTranscriptionProvider`) |
| **Strategy** | Behavioral | `queue-delivery-strategy` | Maintained | Baseline Queue processor and delivery strategy |
| **Dependency Injection** | Structural | `backend-di-container` | **Extended** | Injected `RecommendationService`, `recommendationPreferencesRepository`, and associated symbol mappings in `CoreModule.ts` and `RepositoryModule.ts` |
| **Repository** | Architectural | `typeorm-repository-layer` | **Extended** | Introduced `RecommendationPreferencesRepository` and `MiRecommendationPreference` entity for user preference persistence |
| **Factory / Registry** | Creational | `api-endpoint-registry` | **Extended** | Registered 4 recommendation endpoints (`for-you`, `preferences`, `preferences/update`, `preferences/reset`) in `endpoint-list.ts` |

---

## 2. In-Depth Pattern Analysis: Recommendation Ranking Strategy

### 2.1 Pattern Intent
Decouple candidate ranking and scoring algorithms from candidate retrieval, safety filtering, and presentation logic, enabling interchangeable ranking policies (e.g., weighted personalized scoring vs. pure chronological ordering) without conditional branching or code duplication.

### 2.2 Participants and Roles

| Participant | Source Location | Role |
|---|---|---|
| `RecommendationRankingStrategy` | `packages/backend/src/core/recommendation/RecommendationStrategy.ts` | **Strategy Interface**: Defines `scoreCandidates(candidates, profile, now): ScoredRecommendation[]` |
| `WeightedPersonalizedRankingStrategy` | `packages/backend/src/core/recommendation/RecommendationStrategy.ts` | **Concrete Strategy**: Computes interest relevance, interaction relevance, recency decay, and diversity penalties |
| `ChronologicalRankingStrategy` | `packages/backend/src/core/recommendation/RecommendationStrategy.ts` | **Concrete Strategy**: Sorts candidates strictly by publication timestamp (`createdAt DESC`) |
| `RecommendationService` | `packages/backend/src/core/RecommendationService.ts` | **Context**: Orchestrates candidate collection, applies hard visibility filters, invokes the active strategy, and caches results |

### 2.3 Refactoring and Code Smell Mitigation
- **Code Smell Addressed**: *Conditionals on Behavior Type / Long Method*. Without the Strategy pattern, `RecommendationService` would need nested `if (mode === 'chronological')` branches intermingled with diversity penalty tracking, scoring formulas, and explanation generation.
- **Refactoring Technique**: *Replace Conditional with Polymorphism*. Encapsulating scoring and sorting behaviors into distinct Strategy classes allows each ranking algorithm to be tested, tuned, and extended in complete isolation.

### 2.4 Behavior Preservation & Regression Verification
- Unit tests verify that `WeightedPersonalizedRankingStrategy` accurately weights explicit topics, inferred topics, interactions, and recency while applying author diversity penalties.
- `ChronologicalRankingStrategy` preserves standard timeline chronological ordering with zero ranking side-effects.
- Hard visibility filters, blocks, mutes, and CH03 malicious link exclusions are enforced strictly in the Context (`RecommendationService`) before candidates reach any strategy, guaranteeing security invariants across all ranking modes.
