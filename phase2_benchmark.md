# Phase 2 Benchmark Report

## Classification Accuracy Table

| Site | Expected | Actual | Match | Confidence | Scrape Quality | AI Agreement |
|---|---|---|---|---|---|---|
| https://github.com | saas | saas | ✅ | 0.94 | HIGH | Yes |
| https://youtube.com | creator | creator | ✅ | 0.40 | HIGH | No |
| https://canva.com | saas | creator | ❌ | 0.40 | HIGH | No |
| https://notion.so | saas | saas | ✅ | 0.40 | HIGH | No |
| https://amazon.com | ecommerce | other | ❌ | 0.00 | LOW | No |
| https://etsy.com | marketplace | other | ❌ | 0.00 | LOW | No |
| https://aliabdaal.com | creator | creator | ✅ | 0.44 | HIGH | No |
| https://webflow.com | saas | saas | ✅ | 0.68 | HIGH | Yes |

## Vote Breakdown Table

| Site | Total Det. Score | Top Votes (Signal -> Category: Pts) |
|---|---|---|
| https://github.com | 33 | ai->saas: 15, businessModel->saas: 10, navigation->blog: 5 |
| https://youtube.com | 9 | navigation->ecommerce: 5, keyword->creator: 3, keyword->creator: 2 |
| https://canva.com | 11 | navigation->creator: 5, cta->saas: 5, structuredData->saas: 3 |
| https://notion.so | 5 | navigation->portfolio: 5, cta->saas: 5, keyword->agency: 2 |
| https://amazon.com | 0 |  |
| https://etsy.com | 0 |  |
| https://aliabdaal.com | 30 | navigation->blog: 5, navigation->creator: 5, navigation->creator: 5 |
| https://webflow.com | 3 | ai->saas: 15, structuredData->saas: 3, structuredData->agency: 3 |

## Confidence Analysis Table

| Site | Det. Score | AI Agreement | Scrape Quality | Final Confidence |
|---|---|---|---|---|
| https://github.com | 33 | Yes | HIGH | 0.94 |
| https://youtube.com | 9 | No | HIGH | 0.40 |
| https://canva.com | 11 | No | HIGH | 0.40 |
| https://notion.so | 5 | No | HIGH | 0.40 |
| https://amazon.com | 0 | No | LOW | 0.00 |
| https://etsy.com | 0 | No | LOW | 0.00 |
| https://aliabdaal.com | 30 | No | HIGH | 0.44 |
| https://webflow.com | 3 | Yes | HIGH | 0.68 |

## Remaining Misclassification Report

### https://canva.com
- **Expected**: saas
- **Actual**: creator
- **Confidence**: 0.4
- **AI Agreement**: false
- **Top Evidence**:
  - [5pts -> creator] navigation (Navigation): "videos"
  - [5pts -> saas] cta (CTA): "sign up"
  - [3pts -> saas] structuredData (JSON-LD): "Organization"
  - [3pts -> agency] structuredData (JSON-LD): "Organization"
  - [2pts -> creator] keyword (Meta Description): "videos"

### https://amazon.com
- **Expected**: ecommerce
- **Actual**: other
- **Confidence**: 0
- **AI Agreement**: false
- **Top Evidence**:

### https://etsy.com
- **Expected**: marketplace
- **Actual**: other
- **Confidence**: 0
- **AI Agreement**: false
- **Top Evidence**:

