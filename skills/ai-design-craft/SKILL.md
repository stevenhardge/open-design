---
name: ai-design-craft
description: |
  Pull the design out of slop-mode and into world-class craft with the Discover → Define → Deliver loop: seed real randomness for inspiration, commit to an ambitious brief, iterate against an independent design critic's numeric bar, enrich with generated imagery and video, then cut whatever doesn't earn its place. Use when an artifact looks generic or "AI-generated", when the user asks for premium, distinctive, or world-class design, when starting a landing page / app screen / prototype with real visual ambition, or when a finished design needs a final taste pass.
triggers:
  - "ai design craft"
  - "design craft"
  - "less ai generated"
  - "make it premium"
  - "make this design distinctive"
  - "world class design"
  - "design taste pass"
od:
  mode: prototype
  surface: web
  platform: desktop
  scenario: design
  category: creative-direction
  design_system:
    requires: false
  craft:
    requires:
      - typography
      - color
      - anti-ai-slop
  example_prompt: "Take this landing page from generic to distinctive: fan out on bold directions using a random seed, commit to one brief, run a design critic until it independently scores 9/10, enrich with generated imagery, then cut every element that does not serve the user."
---

# ai-design-craft

Before making frontend design decisions or writing or changing CSS, read <https://good-css.com/> and consult the entries relevant to the artifact. Apply them within the project's browser support, accessibility requirements, and design system.

An agent's default visual output is the most likely token at every step: a purplish gradient, text on the left, a graphic on the right, a nav bar, a CTA. That is design by committee — the floor, not the ceiling. Closing the gap to a memorable design is not a matter of a stronger model; it is an external push against the model's own predictability.

Work in three stages, in order. Do not start the next stage until the current one's completion criterion holds.

- **Discover** — fan out across genuinely different directions, then commit to a bold brief. *Done when* one written brief describes an aesthetic worthy of a top studio, not a layout.
- **Define** — iterate until the design has an identity of its own. *Done when* an independent critic scores it 9/10 or higher, or two to three iterations are exhausted and the best is chosen.
- **Deliver** — remove everything that does not serve the user. *Done when* every remaining element has a purpose you can state in one sentence, and no AI tells survive.

Foundation, stated once because every technique below works around it: LLMs predict the most likely next token, and preference training rewards safe, crowd-pleasing choices. Great design is an emotional response and a deliberate rule-break. Randomness, ambition, and taste therefore have to enter from *outside* the model — from a seed, from the brief, from a critic, or from the user.

## The technique ladder

The stages say *when*. The ladder says *how hard to push*. Climb one rung at a time and stop as soon as the stage's completion criterion holds — each rung costs tokens, reversibility, or both.

| # | Rung | The move | Climb when | Anchor |
| --- | --- | --- | --- | --- |
| 1 | Constrain the brief | Name one concrete aesthetic reference and ban the known defaults | Always — it is nearly free | Anthropic, *Prompting for frontend aesthetics* (2025-10) |
| 2 | Inject entropy | Seed string, era or oblique constraint, or "N directions with probabilities" | The output is on-pattern but not wrong | SSoT (arXiv 2510.21150); Verbalized Sampling (arXiv 2510.01171) |
| 3 | Externalize the taste | Write it down: a `DESIGN.md` of tokens, or a one-line design read plus variance / motion / density dials | Directions keep repeating, or you keep re-describing the user's taste | *Seed strings*, below; the `taste-skill` family |
| 4 | Independent critic | A second agent, screenshot only, fresh context, numeric bar, ranked against references | It looks finished to the author and generic to everyone else | *Design critic*, below; NN/G judge-evaluate-iterate |
| 5 | Generative media | Images first, then video and motion, replacing the code-native substitutes | The composition is right but reads flat or cheap | *Generated imagery* / *Generated motion*, below |
| 6 | Subtract and lint | Delete every element without a stated purpose, then run a deterministic anti-slop gate | Last, always | *Deliver*, below; the project's anti-slop checklist |

- **Climb one rung at a time.** Applying two at once makes it impossible to tell which one moved the design.
- **If two rungs in a row do not move the critic's score, the brief is the problem.** Go back to rungs 1–3 rather than higher.
- **Rung 2 depends on the model generation.** On models that expose no sampling controls, variety has to come from explicit per-variation specs rather than a temperature knob. Seed strings and verbalized distributions still work, because the entropy lives in the text, not the sampler.
- **Do not over-climb.** More wildness is not better: diversity that trades away quality is a loss, which is precisely why Guided Generation exists. Banning a default only reveals a second-order default — after Inter comes Instrument Serif and cream-and-terracotta. Judge every rule by context.
- **Keep the failures.** Prompts that miss today often land on the next model; that is how the current ceiling gets measured.

## Discover

### Seed strings

The model cannot act randomly. Asked for "something totally unique," it returns the same palette and structure wearing different words. Supply the randomness from outside — String Seed of Thought: generate a random string, derive the creative direction from it, never reveal it.

```
Build me a landing page for <product>.

Follow this procedure:
1. Generate a long, random alphanumeric string with a shell script
   (e.g. LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64).
2. Define the creative direction — color scheme, layout, typography — based on
   the string. Look beyond the surface: subpatterns, special numbers, anything
   that inspires you.
3. Use your judgment to bring this direction to life and make it look great.

Don't reveal the string in the design. It's only for your inspiration.
```

Run the same brief a few times to see real variation. An equivalent move that needs no shell is to ask for several directions *with probabilities* — "give me 5 distinct design languages for this product and how likely each is" — which relieves the pressure to produce the single most typical answer.

### Ambitious briefs

The strongest push is a specific, strange vision the user supplies: name a real reference — a game, an interior trend, an art installation — and say how it should bend the design. Vague ambition produces slop; a concrete world produces decisions.

```
Build me a landing page for <product>, with a bold pixel art theme and stunning
graphics. Each section should feel like a still from a video game, yet somehow
it should all function as a landing page.
```

Two more shapes that reliably break the default: an isometric living 3D city where features become neighborhoods or buildings; and a radically asymmetric layout with dissonant color and type, uncomfortable negative space, and the rules broken while still looking good.

**Finding briefs worth using.** Do not ask the model for ideas and paste them back — those are the average ideas everyone gets. Expand the user's imagination, then steer with their taste:

1. Fan out, high level: "I want a bold, unique design language for this product. List as many ideas as you can with short, high-level descriptions. Go broad, not deep."
2. Visualize the favorites and say how you react — what pulls you in, what feels tacky, which generic move to avoid, what bores you. Then: "Sharpen this one based on my tastes."
3. Iterate to satisfaction, then: "Write a concise prompt an AI agent could use to build an initial POC page with this."

Chase ideas that sound like they cannot work. "There's no way this will succeed" is the signal you are outside the average distribution. Discard the failures but keep those prompts — retest them when a new model ships, so you know where the current ceiling sits.

## Define

Even good starting designs lean on stale patterns: nav up top, text left, graphic right. Define is where an individual personality is installed.

### Design critic

Reviewing your own design fails: you have read the code, the earlier decisions, and your own rationale, so you defend them. The agent that decides "good enough" must be a *different* agent, in a fresh context, looking only at a screenshot.

```
Improve this design. To decide what to focus on, use <strong model> as a design
critic subagent.

At each iteration:
- Capture a screenshot of the current artifact (full-page, current viewport).
- Invoke the critic in a fresh context with only the screenshot — no code, no
  implementation details, no earlier iterations or critiques.
- Ask it to (a) evaluate the aesthetic the design is going for, (b) imagine how
  a top design studio would execute that aesthetic, (c) outline the biggest
  gaps, and (d) score the design out of 10 for closeness to that studio bar.

Guidance to give the critic in its prompt:
- Think about overall structure and composition, and about fine details.
- Penalize patterns that feel overdone, excessive, or obviously AI-generated.
- Give tight, specific feedback, not vague prose.
- Be bold and opinionated; avoid what is safe or easy.

My work is only complete when the critic independently scores 9/10 or higher.
Keep that criterion here, out of the critic prompt — the critic must stay an
objective scorer. Use the same critic prompt every iteration.
```

Because the critic is consulted only for executive decisions — typically under 10% of output tokens — a large, expensive model can hold the taste while a cheaper, faster one does the implementation.

Getting the loop right matters more than the prompt:

- **Make the criterion objective.** Weak: "judge whether it's beautiful and not AI-generated." Workable: "visualize how a top studio would execute this aesthetic, then judge against that bar." Strong: "here are five designs — four professional examples and one screenshot of ours; rank them by polish and taste." Comparison beats an absolute score. Classifying the output into a type first, then scoring against criteria specific to that type, makes the judgement reproducible.
- **Give the critic a visual baseline** — comparable screenshots, designs the user likes, or generated concept art, framed as a moodboard rather than a target to copy.
- **Bound the loop.** An unbounded critic is never satisfied. Run one or two iterations, check whether the score is converging, then decide on more.
- **Cast the right model per role.** Large for the critic — more parameters means better design sense and a wider distribution of ideas; capable-but-cheaper for the implementer, never so small it cannot execute a direction.

### Generated imagery

Agents reach for the cheap code-native substitutes — gradients, shapes, patterns — and those are exactly the AI tells. Images fix this fastest, and agents underuse image tools rather than lacking them.

Wiring, in order of preference:

- **Built-in image generation** (Codex, Antigravity, Grok Build, or any runtime that ships the tool): instruct the agent to use it — it knows how, and will not reach for it unprompted.
- **A ChatGPT subscription via the Codex CLI:** "Use the Codex CLI to generate images; help me install it if it isn't present. Make sure it bills my subscription, not an API key."
- **An OpenAI or Gemini API key:** create a dedicated key with a tight spend cap. A single aggregator key that fronts many models is often the better shape, because the agent can then pick the best current model without new integrations.

Keep keys under the rules in *Guardrails*. Then instruct explicitly:

```
The design is plain. Add personality using image generation. Consider shaders
or 3D effects combined with images for more interesting visuals. Verify the
result frame-by-frame in the browser.
```

### Generated motion

Video models reach what code cannot fake: caustic refraction, complex physical behavior, fluid state changes. Use an aggregator so one key covers generation, editing, and background removal, and the agent can pick the most capable current model.

- **Animated graphics.** Generate a looping clip on a solid background, then chroma key it out — or, for complex silhouettes, run a video matting pass. The result layers into the UI without reading as video. Bake refraction by rendering the clip over the page's background colors first, then removing the background.

```
Replace the image on this page with a looping video clip that does something
more interesting: have the crystal splinter apart and slowly spin, with glassy
effects that refract the page background and cast shadows and light around it.

For convincing glass refraction, render the video over the page background
colors first so the refraction is baked in, then remove the background with a
video matting model.

Find appropriate recent models for video generation and background removal.
```

- **Fluid state transitions.** Keyframe-interpolating models turn two product stills into a transition clip. Play it on an action, or scrub it frame-by-frame against scroll or swipe. Seed each transition with the previous clip's final frame so the chain stays seamless.

```
Build a demo page for <product> that uses a video model to create interactive
transitions between screens. Each screen shows the product in a different
state, with vertical motion suited to scrolling:
- initially floating high in the air
- then landing and popping open
- finally, contents settling in from the top

Generate the initial frame with your image tool, then a video clip from that
frame to the next state. Seed the next transition with the final frame of the
previous clip so the motion continues seamlessly. Scrub through the
transitions as the user scrolls.

Pick a video model with strong physics and consistency.
```

Verify motion frame by frame in the browser; a rendered GIF that plays is not proof the interaction is right.

## Deliver

### Cut what does not add value

Agents add; they rarely subtract, and over-explanation plus decorative filler is the loudest signal of machine design. Restraint reads as premium, and most Deliver effort is deletion.

Review the artifact against the brief and ask, element by element, whether it serves the user. Then remove concretely: simplify the layout, drop gradients, glows, and containers that hold nothing, and delete labels that restate the visual beside them. Prefer the platform's native components over custom ones that look worse. If a heading, badge, or helper text exists to make the page look thorough, delete it and see whether anything is missed.

The push is required because stripping a design is a risk, and risk is exactly what the model avoids by default.

### Remove AI tells

The published version of this technique sits behind its paywall, so the registry below is reconstructed from the visible portion, the article's own before/after examples, and the project's anti-slop checklist. Sweep the finished design against it and fix every hit before shipping.

- **Color** — a framework's default indigo or blue-violet as the accent (`#6366f1`, `#4f46e5`, `#8b5cf6`, `#7c3aed`, `#a855f7`); a two-stop purple→blue, blue→cyan, or indigo→pink gradient across the hero; the accent reused so often it stops signalling. Use the design doc's accent instead, cap it at about two visible uses per screen, and prefer a flat deliberate surface where the gradient was.
- **Type** — a hardcoded Inter / Roboto / `system-ui` display face; one weight and one size doing all the work; no tracking, leading, or numeral alignment. Pair an expressive display face with a readable body face and set the scale deliberately.
- **Layout** — the hero → features → pricing → FAQ → CTA skeleton with nothing added; identical density everywhere; a card carrying both a radius and a colored left border; decorative blob or wave SVGs; a fully symmetric composition with no tension. Add one unconventional section, alternate dense and breathing sections, drop either the radius or the border.
- **Content** — emoji standing in for icons; invented metrics ("10× faster", "99.9% uptime", "3× more productive"); filler copy (`lorem ipsum`, "Feature one", "Sample content"); headings and containers that hold nothing. Use monoline SVG at a consistent stroke with `currentColor`, and real numbers or a labelled placeholder.
- **Over-explanation** — labels that restate the visual beside them, prose that narrates the interface, elements included to look thorough. Delete it and see whether anything is missed.
- **Code substitutes** — gradients, blur, and CSS shapes standing in for imagery the design actually needs. Generate or source the image.

## Guardrails

- **Keys** live in a gitignored `.env.agents`, scoped to development, spend-capped, and never referenced from shipped code. One key per provider, revocable without disturbing other work.
- **Verify visually, every iteration.** Screenshot the design, and check motion frame-by-frame in the browser. Agents will report success on a broken render.
- **Keep the loop bounded** by the critic's numeric bar, not by the implementer's sense of satisfaction.
- **Save failed prompts** and retry them against newer models; that is how you find where the current ceiling sits.

## OpenDesign integration

- **The active `DESIGN.md` is the brand contract.** Its tokens win over generic craft guidance on conflict; craft rules still govern everything the brand does not override (letter-spacing, accent overuse caps, anti-slop patterns).
- **The injected craft references are enforceable.** `od.craft.requires` names `typography`, `color`, and `anti-ai-slop`; `craft/anti-ai-slop.md` is the enforced, linter-backed subset of the tell registry above. Read it, treat its auto-linted rules as a hard gate rather than a preference, fix failures in place, and emit the verify scorecard the daemon expects.
- **Bundled skills carry rungs 1–3.** `taste-skill` (upstream v2) deals researched directions and section blueprints from a library distilled from 247 gallery sites, then enforces a house style measured in a real browser; `taste-skill-v2-experimental` keeps the earlier dial-driven design read (`DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`), and `taste-skill-v1` the original. `design-md` and `reference-design-contract` turn references into a written contract, `enhance-prompt` adds UI/UX vocabulary, and `design-review` runs the audit-and-fix pass.
- **Media runs through the `fal-*` skills.** They cover image and video generation, editing, and background removal behind one aggregator key, which is the shape *Generated imagery* and *Generated motion* describe.
- **Tag sections with `data-od-id`** so comment mode can target them; an untagged section is a polish tell.
- **Screenshot with intent.** Capture the artifact at the widths the design must survive before handing a screenshot to the critic, and never hand the critic the source.

## Source

Anshu Chimala, "How to turn your AI into a world-class designer," Lenny's Newsletter, 2026-09-01. https://www.lennysnewsletter.com/p/how-to-turn-your-ai-into-a-world — a Double Diamond process reimagined for a team of AI agents. Techniques 1–6 here follow the original closely. Technique 7 is paywalled; its registry is reconstructed from the visible portion and the article's examples, cross-checked against the project's anti-slop checklist.

## Related techniques

Rungs 1–4 generalize the article with work published around it:

- Anthropic, *Prompting for frontend aesthetics* (Prithvi Rajasekaran, 2025-10-21) — four guided dimensions, the explicit avoid list, and the warning that banning the first-order defaults only surfaces the second-order ones.
- Sakana AI, *String Seed of Thought* (arXiv 2510.21150) — a randomly generated string used as the model's own seed.
- Zhang et al., *Verbalized Sampling* (arXiv 2510.01171) — request a distribution over responses instead of one response, to escape mode collapse from typicality bias.
- NN/G, *The Core Skill of Design in the AI Era: Critique* (Adam Elman, 2026-06-12) — judge-evaluate-iterate, and how to make criteria objective: classify the output into types first, then score against type-specific criteria.
- *Vision-Guided Iterative Refinement for Frontend Code Generation* (arXiv 2604.05839) — VLM-based critique of generated frontend code beats a single inference pass.
- TasteSkill (Leon Lin) — the one-line design read plus the variance / motion / density dials.
- Impeccable's slop detector — the deterministic rules the anti-slop gate mirrors.
- Franceschelli & Musolesi, *Creative Beam Search* (arXiv 2405.00099) and Wang et al., *Mixture-of-Agents* (arXiv 2406.04692) — generate-many-then-judge, and layering agents so each reads the others' output.
