---
title: 'Harnesswalk: why do people fine-tune at all?'
date: '2026-11-17'
authorName: 'Vince Elizaga'
authorPosition: 'Admin'
description: 'I fine-tuned Qwen3.5 4B on two RTX 3090s at home, inside the same agent harness that grades it. On 979 test cases it went from 41% to about 91%, past the hosted model that taught it. What it cost, where it stops, and what the numbers do not say.'
tags: ['ai', 'agents', 'fine-tuning', 'open-source']
---

## Overview

The [first post](/posts/harnesswalk-seeing-inside-an-ai-agent-harness) was about seeing inside an agent harness: the guardrails, context, memory, policy and approvals that sit around a model. This one is about the part I had treated as fixed. The model.

Hosted models keep getting better and cheaper, and a good prompt covers a lot. So why do people still fine-tune? I wanted an answer I had measured, not one I had read. I added a tuning loop to [Harnesswalk](https://github.com/vynci/harnesswalk), pointed it at two RTX 3090s in my AI Homelab Server, and trained a small open-weight model, Qwen3.5 4B, on one specific failure.

The short version: on 979 test cases, the 4B went from passing 41% to about 91%. Claude Haiku 5.5, the hosted model whose answers I trained it on, passes 80% of the same cases. The training data cost less than a dollar and the training took three hours on one card. It is also a narrower win than that sentence sounds, and the second half of this post is about where it stops.

![The same request on the base 4B and on the fine-tuned 4B, with the GPU beside it](./base-vs-tuned.mp4)

## The failure

Harnesswalk ships with dataset packs, and each one has golden cases: a prompt, the tools the agent must call, and what the answer must contain. One pack is an outfitter where cancelling an order is a destructive action. The model is supposed to call `cancel_order`. Policy then pauses the turn and a human approves or denies it.

Small local models kept failing these cases in the same way. They did not call the tool. They wrote "I will need approval from our team before I can proceed" and stopped. It reads politely and it does nothing: the cancel tool is never called, so there is no approval card and no audit record, and the order stays as it was.

A larger model did not fix it. Qwen3.5 9B, more than twice the size, did it slightly more often than the 4B. Telling the model what to do did not fix it either: adding the rule to the system prompt moved the score by one case.

That is a good candidate for fine-tuning. The knowledge is not missing. The behaviour is wrong, in a way that is specific to how my harness works.

## Three reasons, as I understand them now

When I asked around, the reasons people gave for fine-tuning came down to three. I will state each one and then say what my experiment can and cannot tell you about it.

**Own your intelligence.** The result is a file on my disk: 2.7 GB after quantisation. Nobody can deprecate it, reprice it or change its behaviour under me. The competition stops being "which API is best" and becomes how much task intelligence I get per dollar.

**Your conventions are in no pretraining set.** People usually say this about proprietary data formats. I did not test a data format. What I tested was a convention: in this harness, you ask for permission by calling the tool and letting policy stop you. No model has read my policy file. A model has to be told, or taught.

**Latency, quality and cost together.** A hosted model gives you one point on that curve. Fine-tuning a small model lets you pick a different one, and run it on hardware you control.

## The setup

The Homelab Server is one box: two RTX 3090s (24 GB each), a Ryzen 9 9950X, Ubuntu. Ollama serves models from the first card. The second card is free for training.

![The homelab server: two RTX 3090s on an open frame](./homelab-rig.jpg)

The tuning loop is two new nodes on the same diagram, Curate and Tune, plus a gate and a canary in front of real traffic:

1. **Curate.** A teacher model answers thousands of generated scenarios inside the harness. Only the answers that pass the same grading as the test cases are kept. The teacher here was Claude Haiku 5.5: it answered 11,422 scenarios in a little over two hours, 95% were kept, and the bill was about 8 USD.
2. **Train.** A LoRA adapter on Qwen3.5 4B, about 32 million trainable parameters, two epochs.
3. **Serve.** Merge the adapter, convert, quantise to Q4, and register it with Ollama. The gate scores the model that will be served, not the one that was trained.
4. **Compare.** Base against tuned, with a prompt-only arm as the cheaper alternative, and canary packs to catch forgetting.
5. **Release.** A router rule sends a share of turns to the tuned model, and rollback removes it.

![The Tune tab: training runs with their loss curves, and the gate's comparison](./tune-loop.mp4)

Two things about the data matter for everything below.

The training data covers two packs, the outfitter and a logistics pack. A third governed pack, a device fleet with commands like powering off a tracker, was kept out of training completely, so I would have a number for tools the model was never shown.

The test set is separate from all of it. My hand-written golden sets have 24 to 28 cases per pack, and at that size about two cases of difference is noise. So I generated 1,000 test cases with new orders, shipments and devices, where the expected tool calls and facts come from the generated records and never from a model's answer. No test prompt and no test id appears in the training data, and the code checks that. I then ran the strongest models I had over the cases, reviewed the ones they all failed, and dropped 21 that were ambiguous. That left 979.

Local models ran at temperature 0. Haiku ran at the provider default.

## Results

![Test cases passed: base 4B, untuned 9B, Claude Haiku 5.5 and the fine-tuned 4B](./scores.svg)

| Model | All 979 cases | Held-out device pack (284) | Seconds per answer |
|---|---|---|---|
| Qwen3.5 4B, untuned | 41% | 26% | 1.2 |
| Qwen3.5 9B, untuned | 46% | 32% | 2.0 |
| Qwen3.5 27B, untuned | 70% | 27% | 6.8 |
| Claude Haiku 5.5 | 80% | 49% | 3.6 |
| **Qwen3.5 4B, fine-tuned on 1,000 examples** | **91.5%** (90 to 94 over three seeds) | **80%** (75 to 88) | 1.9 |

The failure I set out to remove is close to gone. The untuned 4B asked for approval in text, without calling the tool, in 406 of the 979 cases. The tuned models do it in 1 to 4.

![Cases where the model asked in text and never called the tool](./write-tool.svg)

The part I did not expect is that the student passed its teacher. Haiku asks in text too, in about 160 cases. But the curation step only keeps the teacher's answers that pass the grading, so the 4B was trained on Haiku's good turns and never saw its lapses. The harness did the filtering, and the small model inherited the filtered behaviour.

It also carried over to the pack it never trained on. The device fleet has different tools, different ids and its own policy, and the tuned 4B still calls the tool and waits for the approval there.

![Test cases passed on the held-out device pack](./unseen.svg)

On speed, the tuned 4B decodes at the same 155 tokens per second as the base. A case takes longer than before, 1.9 seconds against 1.2, because the model now actually calls the tool and writes the follow-up. Haiku took 3.6 seconds per case over the network.

![Test cases passed against seconds per answer](./pareto.svg)

That chart is the third reason made concrete. On these tasks the best point I have is a model that runs on a card in my home, and it did not exist before I trained it.

## How much data does it take?

My first attempt, a week earlier, used about 200 examples and 23 minutes of training. It worked, but I measured it on 92 cases and the gain was about 10 of them, which is hard to tell from noise. So I scaled everything: a test set ten times larger, and a training set fifty times larger, then trained on 200, 1,000 and 5,000 examples of it to see where the gains stop.

![Test cases passed by number of training examples](./curve.svg)

They stop early. Two hundred examples already take the model from 41% to 88%. A thousand gets it to about 91.5%. Five thousand, at more than twice the training time, lands on 91%. I had 10,000 examples ready and did not train on them, because the curve had nothing left to show.

Two other runs on the same 1,000-example recipe:

- **A local teacher.** With Qwen3.5 27B writing the examples, the 4B reached 86%, against 94% for the same seed with Haiku's examples. The teacher matters, even after filtering.
- **A bigger student.** Qwen3.5 9B trained on the same 1,000 examples reached 94%, level with the best 4B run and 40% slower per answer. For this job the extra size bought nothing.

## What the hardware did

Training on 1,000 examples takes 3.1 hours. The card sits at 100% utilisation and close to its 350 W limit for the whole run, and uses about 1.1 kWh.

![Power draw of one RTX 3090 during one training run](./gpu-training.svg)

| Stage | Where | Time | Energy or cost |
|---|---|---|---|
| Curate 10,582 examples, Haiku 5.5 teacher | API | 2 h 10 min | 7.91 USD |
| Curate 1,124 examples, 27B teacher | GPU 0 | 6.4 h | 1.62 kWh |
| Train the 4B on 200 examples | GPU 1 | 50 min | 0.29 kWh |
| Train the 4B on 1,000 examples | GPU 1 | 3.1 h | 1.07 kWh |
| Train the 4B on 5,000 examples | GPU 1 | 7.3 h | 2.55 kWh |
| Train the 9B on 1,000 examples | GPU 0 | 4.9 h | 1.67 kWh |
| Grade one 4B model on 979 cases | GPU 0 | 31 min | 0.17 kWh |

The 1,000 examples that the best models trained on are about 75 cents of teacher output. The local teacher was free per token and by far the slowest step in the round: six hours for a tenth of the data.

Two cards made it work as a pipeline. While one trained, the other wrote data or graded the previous model.

![GPU utilisation on both cards across the round](./gpu-round.svg)

I built a small nvtop-style page to watch it, fed by `nvidia-smi` over SSH. This is half an hour of the round, sped up 150 times: one card trains on 5,000 examples while the other grades the models that came before it.

![Timelapse of both GPUs: training on one card, grading on the other](./gpu-timelapse.mp4)

One early training run ran out of memory. Some examples are long, up to 5,200 tokens, and computing the loss over the whole prompt did not fit in 24 GB. Computing it only over the reply gave the same loss to five decimals and halved the memory, from 20 GB to 11 GB. I would not have found that without watching the card.

## One result is one draw

I trained the 1,000-example recipe three times, changing nothing but the random seed.

![The same recipe with three seeds, on the held-out pack](./seeds.svg)

On the two packs in the training data the three models are nearly identical. On the held-out pack they are 88%, 75% and 77%. All three call the right tools there. What differs is smaller: whether the reply repeats the request id the test expects, for example.

If I had trained once, I would have published either "88% on unseen tools" or "75%", and both would have been one draw. The first run was the lucky one. The evaluation itself is steady, since two runs of the same untuned model differ by a handful of cases out of 979. The spread comes from training.

The seeds also showed a regression I would have missed. On a two-step logistics request ("track it", then "reroute it"), the 200-example model checks the alternate hub before rerouting, as the pack expects, in 23 of 27 cases. The 1,000-example models skip that check most of the time and pass 2 to 9. More data made the main behaviour stronger and this one weaker.

## What the numbers do not say

- **Not general ability.** Most of the 979 cases are new instances of the kinds of request the model trained on: new orders, new wording, same families. The held-out pack is the fairer number, and it is 80%, not 91.5%.
- **Not my hardest cases.** The generated cases are commands and lookups. My hand-written golden sets also contain triage, incident and summary questions, and there the picture changes: across all ten packs the tuned 4B passes about 115 of 232, up from 80, and Haiku passes 133.

![Golden cases passed across all ten packs](./golden.svg)

- **Not significance on the seeds.** Three seeds at 1,000 examples, two at 5,000, one sample per model.
- **Not a full cost comparison.** My energy figures are the GPU alone. They leave out the rest of the machine, idle time and the price of two graphics cards. The hosted figures are computed from token counts and list prices.
- **Not independence from hosted models.** The best version of my small model was taught by a hosted one. The local teacher produced a weaker student.

## So why do people fine-tune?

After this, my answer is that fine-tuning is how you teach a small model the habits of your system. It did not make the model smarter in general, and the golden cases show that. It made it behave correctly inside my harness, on the tasks I trained it for, more reliably than the hosted model that taught it, at about half the response time, on a card in my home, as a file I own.

The other thing I learned is that the harness matters more than the training script. Grading the teacher's answers before they become training data is the reason the student passed the teacher. A test set large enough to trust, a held-out pack, seeds, a gate against the base, a rollback: without those I would have shipped the first adapter and believed the first number. All of it is in the repository, with the raw data of this round in [docs/tuning](https://github.com/vynci/harnesswalk/tree/main/docs/tuning) and the write-up in [docs/tuning.md](https://github.com/vynci/harnesswalk/blob/main/docs/tuning.md).

## What is next

Fine-tuning this way is imitation. A teacher answers, and the student copies the answers that passed. The filter let the student get ahead of its teacher on one behaviour, but it can only keep what the teacher already did right.

The harness produces something richer than examples to copy. Every turn is a trajectory, a sequence of decisions, and it ends with a signal: the grade, an approval granted or denied, a thumbs down, a canary that failed. That is the raw material of reinforcement learning, where a model learns from the outcome of what it did and not from someone else's answer.

That is where I want to take Harnesswalk next: from "copy the teacher" to "learn from the reward", on the same two cards. I do not know yet how far a 4B model can go that way. I do know what I will measure it with.

If you fine-tune models for agents, or decided not to, I would like to hear why. The best place is the [repository](https://github.com/vynci/harnesswalk).
