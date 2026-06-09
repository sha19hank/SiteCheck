# Phase 2.5 Benchmark Report

## Classification Accuracy Table

| Site | Expected | Actual | Match | Confidence | Platform Type |
|---|---|---|---|---|---|
| https://github.com | saas | saas | ✅ | 0.48 | N/A |
| https://youtube.com | creator | ecommerce | ❌ | 0.40 | N/A |
| https://canva.com | saas | saas | ✅ | 0.40 | N/A |
| https://notion.so | saas | saas | ✅ | 0.40 | N/A |
| https://amazon.com | ecommerce | other | ❌ | 0.00 | N/A |
| https://etsy.com | marketplace | other | ❌ | 0.00 | N/A |
| https://aliabdaal.com | creator | creator | ✅ | 0.42 | N/A |
| https://webflow.com | saas | saas | ✅ | 0.40 | N/A |

## Confidence Analysis Table

| Site | Det. Score | Evidence Count | AI Agreement | Scrape Quality | Final Confidence |
|---|---|---|---|---|---|
| https://github.com | 22 | 6 | No | HIGH | 0.48 |
| https://youtube.com | 5 | 3 | No | HIGH | 0.40 |
| https://canva.com | 8 | 5 | No | HIGH | 0.40 |
| https://notion.so | 5 | 3 | No | HIGH | 0.40 |
| https://amazon.com | 0 | 0 | No | LOW | 0.00 |
| https://etsy.com | 0 | 0 | No | LOW | 0.00 |
| https://aliabdaal.com | 17 | 5 | No | HIGH | 0.42 |
| https://webflow.com | 3 | 2 | No | HIGH | 0.40 |

## AI Status Report

| Site | AI Status | AI Agreement |
|---|---|---|
| https://github.com | AI_QUOTA_EXCEEDED | No |
| https://youtube.com | AI_QUOTA_EXCEEDED | No |
| https://canva.com | AI_QUOTA_EXCEEDED | No |
| https://notion.so | AI_QUOTA_EXCEEDED | No |
| https://amazon.com | AI_QUOTA_EXCEEDED | No |
| https://etsy.com | AI_QUOTA_EXCEEDED | No |
| https://aliabdaal.com | AI_QUOTA_EXCEEDED | No |
| https://webflow.com | AI_QUOTA_EXCEEDED | No |

## Platform Type Results

| Site | Platform Type |
|---|---|
| https://github.com | N/A |
| https://youtube.com | N/A |
| https://canva.com | N/A |
| https://notion.so | N/A |
| https://amazon.com | N/A |
| https://etsy.com | N/A |
| https://aliabdaal.com | N/A |
| https://webflow.com | N/A |

## Canva Validation Report

**Expected**: saas

**Actual**: saas

**Summary**:
- "sign up" CTA detected
- Organization schema detected

**Top 5 Evidence**:
- [5pts -> creator] navigation (Navigation): "videos"
- [5pts -> saas] cta (CTA): "sign up"
- [3pts -> saas] structuredData (JSON-LD): "Organization"
- [3pts -> agency] structuredData (JSON-LD): "Organization"
- [2pts -> blog] keyword (Meta Description): "posts"

## Remaining Misclassification Report

### https://youtube.com
- **Expected**: creator
- **Actual**: ecommerce
- **Confidence**: 0.4
- **AI Status**: AI_QUOTA_EXCEEDED
- **Top Evidence**:
  - [5pts -> ecommerce] navigation (Navigation): "shop"
  - [3pts -> creator] keyword (Title): "youtube"
  - [2pts -> creator] keyword (Meta Description): "videos"

### https://amazon.com
- **Expected**: ecommerce
- **Actual**: other
- **Confidence**: 0
- **AI Status**: AI_QUOTA_EXCEEDED
- **Top Evidence**:

### https://etsy.com
- **Expected**: marketplace
- **Actual**: other
- **Confidence**: 0
- **AI Status**: AI_QUOTA_EXCEEDED
- **Top Evidence**:

