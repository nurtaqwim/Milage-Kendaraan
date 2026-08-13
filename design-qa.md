# Design QA — External Mobil TLO template alignment

## Comparison target

- Source visual truth: `C:\Users\oms.taqwim\Documents\mileage-customer-portal-v4.3-audited\mileage-customer-portal-v4\qa-tlo-reference.png` (captured from `http://localhost:5174/guest/kendaraan/mobil-tlo`)
- Implementation screenshot: `C:\Users\oms.taqwim\Documents\mileage-customer-portal-v4.3-audited\mileage-customer-portal-v4\qa-tlo-implementation.png`
- Side-by-side evidence: `C:\Users\oms.taqwim\Documents\mileage-customer-portal-v4.3-audited\mileage-customer-portal-v4\qa-tlo-comparison.png`
- Source and implementation pixels: 1265 × 712. Browser viewport state: desktop, first purchase step, default data state.
- Normalization: captures share the same browser viewport and density, then were composed side-by-side without scaling.

## Findings

No actionable P0, P1, or P2 fidelity findings.

- The reference is the customer-facing **Mobil TLO** journey. The implementation now follows its public hero composition, vehicle background, translucent public header, centered navigation, large white checkout surface, and pale-blue horizontal progress panel.
- Fonts and typography: Montserrat is applied to the implementation, with the display title, centered hero copy, compact step labels, and orange active-state copy aligned to the source hierarchy.
- Spacing and layout rhythm: the hero-to-card overlap, large exterior margin, 20px card corners, progress-panel padding, and centered form entry all match the reference. The seven-step track is intentional because the mileage journey has seven customer checkpoints rather than TLO's three.
- Colors and visual tokens: the reference's photograph overlay, navy-blue surface, orange active navigation, pale blue stepper, and blue-grey border system are applied.
- Image quality and asset fidelity: the source vehicle background and supplied Danantara/Jasindo raster assets are reused; no logo or hero image is approximated with code.
- Copy and content: application-specific mileage content remains intact by design.

## Focused region comparison

The header, hero, horizontal stepper, and start of the checkout surface are all legible in the full-view composition, so an extra crop was not needed. The side-by-side evidence shows their shared frame, image treatment, navigation, typography, and white-card rhythm directly.

## Interaction and technical checks

- `npm run build`: passed.
- In-app browser: first purchase step rendered successfully.
- Help modal opened from **Bantuan**; its heading appeared exactly once.
- Primary **Lanjutkan** control was present exactly once.
- Browser console errors: 0.

## Implementation checklist

- [x] Apply reference palette and typography tokens.
- [x] Rework global header and navigation shell into the public customer template.
- [x] Replace the internal sidebar with a public horizontal checkout stepper.
- [x] Rework card, form, button, and summary styles used across all purchase steps.
- [x] Apply matching header treatment to the post-purchase dashboard.
- [x] Reuse supplied brand assets.

## Follow-up polish

- [P3] The dashboard intentionally remains a post-purchase information view. It can be given the same public hero treatment if you want customer navigation to remain visually identical after policy issuance.

## Comparison history

1. Initial comparison used an internal workspace screen and was superseded after scope correction.
2. External Mobil TLO comparison: public hero, header, progress panel, and checkout shell aligned; no actionable P0/P1/P2 findings.
3. Flow simplification: replaced the seven checkpoint navigation with four customer stages. Verified the rendered stepper contains four stages, no stale `Langkah 1 dari 7` label remains, and browser console errors remain at zero.

final result: passed
