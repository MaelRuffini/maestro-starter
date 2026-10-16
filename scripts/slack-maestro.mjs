#!/usr/bin/env node
/**
 * Slack Socket Mode bridge: a client talks in Slack; a Cursor cloud agent
 * runs /new-slice against this repo (SKILL.md).
 *
 *   npm run slack
 *
 * Required env (see .env.local.example): SLACK_BOT_TOKEN, SLACK_APP_TOKEN,
 * CURSOR_API_KEY, CURSOR_CLOUD_REPO.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "./lib/load-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storePath = path.join(root, ".maestro-slack.json");

const SYSTEM_PROMPT = `You are Maestro, building one Prismic slice at a time for a marketing website.

The person you are talking to is a **client in Slack**. They do not have Cursor. They send a Figma URL and instructions. You follow SKILL.md and the /new-slice command in this repository exactly:

1. One slice = one Figma frame = one commit on main. Several frame URLs: one batch brief, one go, then one commit each (SKILL.md §3.5.1). Do not ask which one. Do not split a frame into its children.
2. Show a brief (name, verdict, variations, fields, layout classes, type, mocks padding, open questions). Wait for them to say go / ok / oui before writing code. A batch is still one brief and one go.
3. Ask for a 12-col grid screenshot when the frame looks grid-aligned and they have not sent one (once for the batch).
4. After go: stay on main, never create feat/slice-* or a pull request. A single simple slice is built in this conversation. A batch uses a fresh dev-slice per frame, at most three at a time, each in a detached worktree (SKILL.md §3.5.1). Scaffold with \`npm run slice:scaffold -- <Name> --fields <file.json>\`. Lint, not a local production build. One 1440 screenshot per slice. Screenshot and metadata only — get_design_context only when metadata cannot answer a measurement.
5. A single slice: commit, \`npx prismic push\`, \`git push origin main\`, then \`npm run prismic:fill -- --slice <Name>\`. A batch: commit each slice as it lands, then one prismic push and one git push, then one fill per built slice. Migration Release only — never publishMigrationRelease.
6. Reply in the client's language. Keep messages short enough for Slack.
7. End with an À finaliser checklist: review /dev/slices, review the Prismic Migration Release, publish.

Never invent a second chat UI. Never add Playwright. Never publish live content.
Translate Figma by measuring boxes, not by copying auto-layout gap or inset (SKILL.md §4.4).`;

const slackChunk = (text) => {
  const limit = 3500;
  if (text.length <= limit) return [text];
  const parts = [];
  let rest = text;
  while (rest.length) {
    parts.push(rest.slice(0, limit));
    rest = rest.slice(limit);
  }
  return parts;
};

const loadStore = async () => {
  try {
    return JSON.parse(await readFile(storePath, "utf8"));
  } catch {
    return {};
  }
};

const saveStore = async (store) => {
  await writeFile(storePath, JSON.stringify(store, null, 2) + "\n");
};

const loadModule = async (name, install) => {
  try {
    return await import(name);
  } catch {
    console.error(`Missing ${name}. From the repo root run: npm install ${install}`);
    process.exit(1);
  }
};

const mentionPattern = (userId) => new RegExp(`<@${userId}>\\s*`, "g");

const collectAssistantText = async (run) => {
  let text = "";
  if (typeof run.stream === "function") {
    for await (const event of run.stream()) {
      if (event.type !== "assistant") continue;
      for (const block of event.message?.content ?? []) {
        if (block.type === "text" && block.text) text += block.text;
      }
    }
  }
  const result = await run.wait();
  if (!text && result?.result) text = String(result.result);
  return { text: text.trim(), result };
};

const postThread = async (client, channel, threadTs, text) => {
  const body = text || "(pas de texte)";
  for (const chunk of slackChunk(body)) {
    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: chunk,
      mrkdwn: true,
    });
  }
};

await loadEnv(root);

const botToken = process.env.SLACK_BOT_TOKEN;
const appToken = process.env.SLACK_APP_TOKEN;
const cursorKey = process.env.CURSOR_API_KEY;
const repoUrl = process.env.CURSOR_CLOUD_REPO;
const startingRef = process.env.CURSOR_CLOUD_REF || "main";

if (!botToken || !appToken) {
  console.error(
    "SLACK_BOT_TOKEN and SLACK_APP_TOKEN are required (Slack app, Socket Mode).",
  );
  process.exit(1);
}
if (!cursorKey) {
  console.error("CURSOR_API_KEY is required (Cursor Dashboard → Integrations).");
  process.exit(1);
}
if (!repoUrl) {
  console.error(
    "CURSOR_CLOUD_REPO is required (GitHub URL of this project, e.g. https://github.com/org/maestro).",
  );
  process.exit(1);
}

const { App } = await loadModule("@slack/bolt", "@slack/bolt");
const { Agent } = await loadModule("@cursor/sdk", "@cursor/sdk");

const app = new App({
  token: botToken,
  appToken,
  socketMode: true,
});

const busy = new Set();

const runCursor = async ({ prompt, agentId }) => {
  const options = {
    apiKey: cursorKey,
    model: { id: "composer-2.5" },
  };

  const agent = agentId
    ? await Agent.resume(agentId, options)
    : await Agent.create({
        ...options,
        cloud: {
          repos: [{ url: repoUrl, startingRef }],
          autoCreatePR: true,
        },
      });

  try {
    const run = await agent.send(agentId ? prompt : `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`);
    console.log(`agent=${agent.agentId} run=${run.id}`);
    const { text, result } = await collectAssistantText(run);
    if (result?.status === "error") {
      return {
        agentId: agent.agentId,
        text: text || "L’agent a rencontré une erreur. Réessaie dans le fil.",
      };
    }
    return { agentId: agent.agentId, text };
  } finally {
    await agent[Symbol.asyncDispose]?.();
  }
};

const handlePrompt = async ({ client, channel, threadTs, text }) => {
  if (busy.has(threadTs)) {
    await postThread(
      client,
      channel,
      threadTs,
      "Je suis encore sur le message précédent. Réessaie dans un instant.",
    );
    return;
  }

  busy.add(threadTs);
  await postThread(client, channel, threadTs, "Maestro réfléchit…");

  try {
    const store = await loadStore();
    const existing = store[threadTs];
    const { agentId, text: reply } = await runCursor({
      prompt: text,
      agentId: existing,
    });
    store[threadTs] = agentId;
    await saveStore(store);
    await postThread(client, channel, threadTs, reply);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    await postThread(
      client,
      channel,
      threadTs,
      `Je n’ai pas pu joindre l’agent Cursor : ${message}`,
    );
  } finally {
    busy.delete(threadTs);
  }
};

app.event("app_mention", async ({ event, client, context }) => {
  const threadTs = event.thread_ts ?? event.ts;
  const botId = context.botUserId;
  const text = (event.text ?? "").replace(mentionPattern(botId), "").trim();
  if (!text) {
    await postThread(
      client,
      event.channel,
      threadTs,
      "Envoie un lien Figma (un frame) et tes consignes. Je te ferai un brief, puis j’attends ton go.",
    );
    return;
  }
  await handlePrompt({
    client,
    channel: event.channel,
    threadTs,
    text,
  });
});

app.command("/slice", async ({ command, ack, client }) => {
  await ack();
  const posted = await client.chat.postMessage({
    channel: command.channel_id,
    text: command.text?.trim()
      ? `<@${command.user_id}> ${command.text.trim()}`
      : `<@${command.user_id}> veut une nouvelle slice.`,
  });
  const threadTs = posted.ts;
  const text = command.text?.trim() || "";
  if (!text) {
    await postThread(
      client,
      command.channel_id,
      threadTs,
      "Colle un lien Figma (un seul frame) et tes consignes dans ce fil.",
    );
    return;
  }
  await handlePrompt({
    client,
    channel: command.channel_id,
    threadTs,
    text,
  });
});

app.message(async ({ message, client, context }) => {
  if (message.subtype || message.bot_id || !message.thread_ts) return;
  if (typeof message.text === "string" && context.botUserId) {
    if (mentionPattern(context.botUserId).test(message.text)) return;
  }
  const store = await loadStore();
  if (!store[message.thread_ts]) return;
  const text = (message.text ?? "").trim();
  if (!text) return;
  await handlePrompt({
    client,
    channel: message.channel,
    threadTs: message.thread_ts,
    text,
  });
});

await app.start();
console.log(
  `Maestro Slack is running (Socket Mode). Repo: ${repoUrl} @ ${startingRef}`,
);
