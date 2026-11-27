# VendOm go-to-market plan: Pakistan, then India, Bangladesh and Sri Lanka (2026–27)

Numbers come from web search results (Nov 2026). Ad costs are agency/vendor benchmarks, so treat them as estimates and check them in your own ad accounts in the first 2 weeks. USD 1 ≈ PKR 280.

## 0. Key facts
| Fact | Number | Source |
|---|---|---|
| Pakistan social media users | 79.9M (Oct 2025), 94.1M (Oct 2026) | [DataReportal 2026](https://datareportal.com/reports/digital-2026-pakistan), [2027](https://datareportal.com/reports/digital-2027-pakistan) |
| Pakistan TikTok ad audience | ~92.8M (vendor estimate); self-serve Ads Manager since Dec 2025 | [Pipiads](https://www.pipiads.com/TikTok-Ad-Targeting-Audience-2022/TikTok-Ad-Targeting-Audience-in-Pakistan-2022), [Dawn](https://www.dawn.com/news/1961838) |
| Pakistan Facebook users | ~69M (approx.) | [NapoleonCat](https://stats.napoleoncat.com/social-media-users-in-pakistan/2026/) |
| Pakistan wallets | 95.8M branchless-banking app users; Raast 742M transactions in Q3 FY26 | [SBP](https://www.sbp.org.pk/psd/pdf/PS-Review-Q3FY26.pdf), [Dawn](https://www.dawn.com/news/2010873) |
| Pakistan COD | 60% of shoppers pay COD; ~18% of COD parcels returned | [Dawn](https://www.dawn.com/news/1962597), [DHL](https://www.dhl.com/discover/en-pk/e-commerce-advice/e-commerce-best-practice/subscription-marketing/how-pakistani-e-commerce-sellers-can-reduce-cod-returns) |
| India | 1.03B internet users; WhatsApp 500M+; TikTok banned since 2020 | [DataReportal India](https://datareportal.com/reports/digital-2026-india), [TechCrunch](https://techcrunch.com/2024/07/31/india-is-the-largest-market-for-meta-ai-usage) |
| Bangladesh | 68.3M social identities, Facebook-led; bKash 82M customers; Meta ads payable via bKash | [DataReportal](https://datareportal.com/reports/digital-2027-bangladesh), [UNB](https://unb.com.bd/category/Bangladesh/small-businesses-in-bangladesh-can-now-pay-for-meta-ads-with-bkash/195062) |
| Sri Lanka | 14.9M internet users, 9.93M social identities | [DataReportal 2027](https://datareportal.com/reports/digital-2027-sri-lanka) |
| Meta CPM (est.) | PK $0.20–0.80, BD $0.20–0.60, IN $0.30–1.20 | [CPM blog](https://mycpmcalculator.netlify.app/blog/cpm-rates-by-country) |
| TikTok (est.) | PK CPM $4–8 (unverified); CPI $0.50–1.80 | [admetrics](https://admetrics.io/en/post/tiktok-ads-costs-complete-2026-pricing-guide) |
| Google CPC (est.) | PK PKR 30–150; India ₹8–25 | [OwlClaw](https://owlclaw.com/benchmarks/ppc-benchmarks-india) |

| Competitor | Price | Our angle |
|---|---|---|
| Shopify | ~PKR 10,800/mo monthly, billed in USD | 10–30× VendOm, needs a card, no native JazzCash/COD workflow |
| Daraz | Commission + payment fee | Seller doesn't own the customer; no WhatsApp selling |
| Markaz | Free reseller app, takes a share | No own brand or store |
| Dukaan (IN) | Free + 4.99% per order, or ~₹299–999/mo | Per-order fees |
| Zoho Commerce (IN) | ~₹599/mo yearly | Built for SMEs, not Instagram sellers |

**The economics decide the strategy.** Rs 300/month ≈ $1.07; ARPU ≈ Rs 450 ($1.60)/month; 12-month LTV ≈ $10–12. Cost per paying user must stay ≤ $5 and cost per sign-up ≤ $0.30–0.40. Paid ads alone can't reach 1M: organic, referrals and partners must bring 80%+ of sign-ups. Ads test messages, retarget and boost posts that already work.

## 1. Who we target and what we say
Pakistan, in order: (1) Instagram/Facebook/WhatsApp clothing and lawn sellers, mostly women at home; (2) home bakers, food, handmade, jewellery, cosmetics; (3) resellers and dropshippers on Markaz/Daraz who want their own brand; (4) small shops; (5) students and side-hustlers.

| Country | Message | Offer (to test) | Language |
|---|---|---|---|
| Pakistan | "Your own online dukaan in 2 minutes by talking to your phone. COD, JazzCash, Easypaisa built in. Rs 300 a month — cheaper than one courier return." | First month Rs 1 for the first 100k | Urdu, Roman Urdu; Punjabi/Sindhi creators |
| India (month 7+) | "Stop taking orders in DMs. WhatsApp store link with UPI and COD, no commission." | ₹99/₹199/₹349 | Hindi/Hinglish, then Tamil, Telugu, Bengali (Reels + Shorts, no TikTok) |
| Bangladesh (month 9+) | "F-commerce page → real store: bKash, Nagad, COD, Bangla AI." | Tk 149/299/499 | Bengali |
| Sri Lanka (month 11+) | "Sell on WhatsApp and abroad with one link." | LKR 349/699/1,199 | Sinhala, Tamil |

**Change the trial:** 4 days is too short to get a first order. Start the 4 days at the first order, or make it 14 days, and measure trial-to-paid. Likely the biggest lever on paid conversion.

## 2. How the ad platforms work
**One rule:** every platform optimises for the event you send it. Send sign-up and first payment from the server (Meta Conversions API, Google conversion import, TikTok Events API).

**Meta (Facebook + Instagram)** — pay per 1,000 views; the algorithm finds people likely to do your objective. Campaign → ad set → ads. Start at $20–30/day in Pakistan:
- Sign-up campaign, broad targeting (Pakistan, 18–45, Advantage+), 5–8 Urdu creator reels — 60% of budget.
- Retargeting site visitors and 50%+ video viewers — 20%.
- Click-to-WhatsApp ads into an onboarding bot — 20%.
- Lowest-cost bid first; add a cost cap (e.g. Rs 100 per sign-up) after 50+ conversions/week; kill ads at 2× target cost, duplicate winners.

**Google Ads** — Search: bid on keywords, pay per click, catches people already searching ("online store banane ka tarika", "Shopify alternative Pakistan"). YouTube: video ads. App campaigns and Performance Max mix everything. Start at $10–15/day on 20–30 high-intent and competitor keywords, manual CPC, then Maximize Conversions after 30+ conversions. Google is for intent, not scale.

**TikTok** (Pakistan, Bangladesh, Sri Lanka) — in-feed ads in For You; Spark Ads boost an organic or creator post (best for us); Smart+ automates. Start at $15–20/day: Spark Ads on the 3 best organic videos each week, optimise for Complete Registration, broad 18+, test 3 hooks a week.

| Metric | Formula | Target (est.) |
|---|---|---|
| CPM | spend ÷ impressions × 1,000 | Meta < $0.80, TikTok < $3 |
| CTR | clicks ÷ impressions | > 1.2% |
| Cost per sign-up | spend ÷ sign-ups | ≤ $0.40 (Rs 110) |
| Activation | stores with 5+ products and a shared link ÷ sign-ups | > 40% |
| Cost per paying user | spend ÷ new paid | ≤ $5 |
| Payback | cost per paying user ÷ ARPU | ≤ 3 months |

## 3. Organic growth (the low-cost core)
**Pillars:** AI magic demos (voice → store); seller success stories with numbers; seller education (COD returns, pricing, photos, couriers); price comparisons with Shopify/Daraz; founder journey.
**Frequency:** TikTok + Reels 2/day; Shorts daily; 1 long YouTube tutorial/week; Facebook 1 post/day + Lives twice a week; WhatsApp Channel daily tip.
**Followers:** reply to comments with videos; duet/stitch sellers; weekly "store makeover" Live; "Comment DUKAAN and I'll build yours" with auto-DMs.

**30 reel hooks**
1. "I built my clothing store in 2 minutes by talking to my phone."
2. "Shopify Rs 10,000 a month, VendOm Rs 300. Same thing?"
3. "My ammi's pickle business is now online." (Urdu voice build)
4. "Stop saying 'price DM karein'."
5. "This one setting cut my COD returns in half." (WhatsApp confirmation)
6. "I gave AI one photo of my lawn suit…"
7. "Daraz takes a cut. Here's how much I kept instead."
8. "Rs 0 to first order in 24 hours — challenge day 1."
9. "POV: customer pays by JazzCash at 2 a.m. while you sleep."
10. "Your Instagram bio link is losing you orders."
11. "Sell abroad from Faisalabad."
12. "Home baker? Take cake orders with dates and advance payment."
13. "Rate my store: I fixed 3 viewer stores live."
14. "3 mistakes every new online seller makes."
15. "Can a 60-year-old make an online store? We tested."
16. "WhatsApp catalog vs a real store."
17. "How I priced my product so courier charges don't kill me."
18. "Free themes that look expensive."
19. "Student side hustle: Rs 50k a month reselling — my setup."
20. "Fake orders? Here's how I block them."
21. "Urdu mein website banao — no English needed."
22. "Eid sale store set up in 5 minutes."
23. "Your customer asked 'COD hai?' 40 times today. Automate it."
24. "I asked AI to design a logo and store for my brand."
25. "Before and after: Facebook page to real website."
26. "How much does it really cost to start online in Pakistan?"
27. "Give your friend 1 free month, get 1 free month."
28. "TCS or Leopards booking right from my store."
29. "Seller of the week: Rs 3 lakh in her first month."
30. "Hindi, Bangla or Sinhala — same 2-minute store."

**Creators:** 200 micro-creators (5k–100k followers) per country; small fee (≈Rs 5k–20k/video) + 30% recurring commission for 12 months on paid referrals, tracked by code; Ambassador tier for top VendOm sellers.
**Communities:** 50+ city/category WhatsApp communities; partner with Facebook seller-group admins (free months for admins).
**YouTube & SEO:** Urdu/Hindi/Bangla tutorials; pages for "online store kaise banaye", "free website for business Pakistan", "Shopify alternative Pakistan", "Shopify price in Pakistan", "JazzCash payment gateway for website", "how to sell on WhatsApp", "COD ecommerce Pakistan", "Dukaan alternative", "free online store India", "F-commerce website Bangladesh"; one comparison page per competitor; free tools (profit calculator, COD return calculator, description generator).
**Referral loop:** "Give 1 month, get 1 month", credited when the friend pays; "Made with VendOm" badge on stores. Aim for this to be the #1 channel by month 9.

| Partner | Deal |
|---|---|
| TCS, Leopards, PostEx, Trax, M&P | Built-in booking, co-marketing to their SME shippers, revenue share |
| JazzCash, Easypaisa (later bKash, Nagad, UPI) | "Open your store" banner to merchants; bundles |
| Universities, incubators | Free 6-month student plan, campus ambassadors |
| Women-entrepreneur programs | Training cohorts with VendOm as the default tool |
| Wholesale suppliers | One-tap supplier catalogs for resellers |

## 4. 12-month plan
- **Pre-launch (months 1–2):** waitlist ("first 10,000 get Rs 1 month"), recruit 50 creators, build 200 seed stores by hand, shoot 60 videos.
- **Pakistan launch (3–6):** 2 videos/day, creator wave, courier and wallet partners, referral program live.
- **Scale (7–12):** India month 7, Bangladesh month 9, Sri Lanka month 11; reuse winning scripts with native creators.

| Month | Ads | Creators | Content/tools | Total (USD) | New sign-ups (est.) | Cumulative |
|---|---|---|---|---|---|---|
| 1 | 300 | 400 | 300 | 1,000 | 2k | 2k |
| 2 | 500 | 600 | 400 | 1,500 | 5k | 7k |
| 3 | 1,200 | 900 | 400 | 2,500 | 12k | 19k |
| 4 | 1,500 | 1,000 | 500 | 3,000 | 20k | 39k |
| 5 | 2,000 | 1,500 | 500 | 4,000 | 25k | 64k |
| 6 | 2,500 | 2,000 | 500 | 5,000 | 30k | 94k |
| 7 | 3,000 | 2,500 | 500 | 6,000 | 40k | 134k |
| 8 | 3,500 | 3,000 | 500 | 7,000 | 45k | 179k |
| 9 | 4,000 | 3,500 | 500 | 8,000 | 55k | 234k |
| 10 | 5,000 | 4,500 | 500 | 10,000 | 65k | 299k |
| 11 | 6,000 | 5,500 | 500 | 12,000 | 75k | 374k |
| 12 | 7,500 | 7,000 | 500 | 15,000 | 85k | 459k |

**Scaling rule:** raise a channel 20–30% a week only while cost per paying user ≤ $5 and payback ≤ 3 months; otherwise freeze it and move money to creators and referrals.

| Funnel stage | Rate | One month at scale |
|---|---|---|
| Video views | — | 25M |
| Clicks | 1.0% | 250k visits |
| Sign-up (phone OTP, no card) | 25% | 62k (+20k referral/partner) |
| Activated store | 40% | ~33k |
| Paid after trial | 6% of sign-ups | ~5k |

After 12 months (estimate): ~459k sign-ups, 25–30k paying, ≈Rs 12M (~$43k) monthly revenue.

| Scenario | 1M sign-ups | Drivers |
|---|---|---|
| Base | Month 17–20 | India from month 7 (~40% of later volume) |
| Upside | Month 12–14 | Viral AI-demo loop + a wallet partner pushing to its merchants |
| Downside | 24+ months | Weak creators or referral loop |

Mix of the first 1M (estimate): organic short video 30%, referral + badge 25%, creators 20%, partnerships 10%, paid ads 10%, SEO/YouTube 5%.

## 5. KPIs and risks
**North-star:** weekly active stores with at least one order.

| Area | Weekly KPIs |
|---|---|
| Top of funnel | Views, followers, top 5 hooks by click rate |
| Acquisition | Sign-ups by channel/creator code, cost per sign-up, referral share |
| Activation | % with 5+ products, % shared link, % first order in 7 days |
| Revenue | Trial-to-paid, new paid, cost per paying user, MRR |
| Retention | Month-1 and month-3 paid retention, churn reasons |
| Quality | Fake-account rate, COD return rate, support response time |

| Risk | Response |
|---|---|
| Fake sign-ups, affiliate fraud | Phone OTP, device checks, commission only on paid users after 30 days, caps |
| Scam/counterfeit stores | Review before going public, report button, CNIC/NIC KYC before payouts |
| Low paid conversion | Trial starts at first order, WhatsApp onboarding, Rs 1 first month, annual discount, "you made Rs 8,000 — keep your store for Rs 300" |
| COD returns (~18%) | WhatsApp order confirmation, shared refuser blocklist, partial advance via wallets, courier return scores |
| Platform dependence | 4+ channels; own WhatsApp communities and email/SMS list |
| Competitors | Compete on local payments, Urdu/Hindi/Bangla AI, COD tools and price |
| Rising ad costs | Keep paid at ~10% of sign-ups; reinvest in creators |
