## Context Management

### Before /compact
When the context is getting large or you are approaching the context limit:

1. Before compacting, summarize the current state of the task.
2. Preserve:
   - Original task/requirements
   - Files modified
   - Important implementation decisions
   - Current implementation status
   - Errors/issues encountered
   - Tests/build status
   - Remaining work
   - Any important constraints or user instructions
3. Use `/compact` only when necessary to continue the current task.
4. After compaction, continue from the preserved context without restarting the analysis.

### When starting a NEW task
When the previous task is complete and I provide a new, unrelated task:

1. Treat it as a completely new task.
2. Use `/clear` before starting the new task.
3. Do not carry assumptions, temporary decisions, debugging context, or implementation details from the previous task unless they are explicitly present in the codebase or the new request.
4. After `/clear`, analyze the new task from the current codebase state.
5. Follow the normal workflow:
   - Analyze the existing implementation.
   - Understand the requirements.
   - Identify affected files/components/services.
   - Create an implementation plan.
   - Wait for my approval before making changes, unless I explicitly tell you to implement immediately.

### Important
- `/compact` = continue the SAME task while reducing context.
- `/clear` = start a NEW task with a clean conversation context.
- Never use `/clear` in the middle of an active task unless explicitly instructed.
- Never use `/compact` as a replacement for understanding the current task.