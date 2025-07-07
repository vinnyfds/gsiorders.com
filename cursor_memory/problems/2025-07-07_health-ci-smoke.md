## Problem  
CI had no reliable "is app up" check and smoke test; pipeline could deploy broken builds.

## Solution  
• Added `/api/health` endpoint with 200/500 paths.  
• Wrote `health.spec.ts` (100 % coverage).  
• Added Playwright smoke test hitting products grid + checkout redirect.  
• Updated CI workflow to curl `/api/health` post-deploy. 