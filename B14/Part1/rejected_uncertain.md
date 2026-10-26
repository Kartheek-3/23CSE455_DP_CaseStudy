# Rejected and uncertain candidates (baseline commit 90ec656)

Observation scope: files read in full: features/ai-assistant/llmService.ts, features/auth/context/*, features/auth/hooks/useSession.ts, lib/supabase/{client,server,service,static}.ts, lib/notifications/{user-confirmed,newsletter}.ts, lib/permissions/index.ts, app/api/webhooks/user-confirmed/route.ts, features/posts/publication.ts, proxy.ts.

## Uncertain (1)
| # | Candidate | Location | Reason |
|---|---|---|---|
| U1 | proxy.ts guard pipeline | proxy.ts:4-117 | Sequential guard checks in one function. Resembles Chain of Responsibility / Intercepting Filter, but there is no handler interface, no successor links and no separate handlers, so roles cannot be mapped without inventing classes. Next.js framework idiom. |

## Rejected (7)
| # | Candidate | Location | Reason |
|---|---|---|---|
| R1 | Supabase client creators as Factory Method / Abstract Factory | lib/supabase/client.ts:3-8, server.ts:4-27, service.ts:3-14, static.ts:4-13 | Four standalone functions chosen by import path. No creator hierarchy, no polymorphic selection, and createStaticClient can return null so they share no contract. |
| R2 | User-confirmed notifications as Observer | app/api/webhooks/user-confirmed/route.ts:67-74; lib/notifications/user-confirmed.ts:23-76 | Two hard-coded calls in Promise.all, each with its own catch. No subscriber list, registration or notifier interface. |
| R3 | sendNewsletterEmail as a pattern | lib/notifications/newsletter.ts:25-61 | Single function wrapping Resend; one participant only. |
| R4 | Post publication validation as State / Specification | features/posts/publication.ts:85-107 | status is a plain string; no state objects or transitions. Validation is one function with sequential ifs, not rule objects. |
| R5 | Repeated provider if-chains as Strategy | llmService.ts:157-339 (generateBlogPost, generateBlogPostHeadless, generateChatTitle, validateProviderKey) | Strategy is not applied here; branching is duplicated. Recorded as a Part 2 refactoring target. |
| R6 | Helper functions | llmService.ts buildSystemPrompt (44-65), resolveGeminiModel (121-125), isRateLimitError (341-356); escapeHtml and sanitizeSubject in user-confirmed.ts and newsletter.ts | Plain utilities, no pattern roles. Duplicated escapeHtml/sanitizeSubject is a code smell. |
| R7 | React Context as a separate Observer instance | AuthContext.tsx:14-23 | Folded into the Auth State Observer as its delivery mechanism; counting it again would double-count. |
