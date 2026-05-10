#!/usr/bin/env node
/**
 * Post a Markdown comment on a Linear issue by team key + number (e.g. NEW-106).
 *
 * Loads LINEAR_API_KEY from the environment, or from repo-root `.env.local`
 * (first matching LINEAR_API_KEY= line only — keep that file gitignored).
 *
 * With Doppler: `doppler run -- node scripts/linearPostIssueComment.mjs NEW-106 "…"`
 *
 * Usage:
 *   node scripts/linearPostIssueComment.mjs NEW-106 "Comment body"
 *   printf '%s' "body" | node scripts/linearPostIssueComment.mjs NEW-106
 *
 * Do not commit API keys.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envLocal = path.join(repoRoot, '.env.local');

function loadLinearKeyFromEnvLocal() {
  if (!fs.existsSync(envLocal)) return;
  const text = fs.readFileSync(envLocal, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^LINEAR_API_KEY\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v && !process.env.LINEAR_API_KEY) process.env.LINEAR_API_KEY = v;
    break;
  }
}

loadLinearKeyFromEnvLocal();

const API = 'https://api.linear.app/graphql';
const key = process.env.LINEAR_API_KEY?.trim();
if (!key) {
  console.error(
    'LINEAR_API_KEY is not set. Add it to .env.local or export it in the shell.'
  );
  process.exit(1);
}

const ident = process.argv[2];
if (!ident || !/^[A-Za-z]+-\d+$/.test(ident)) {
  console.error('Usage: linearPostIssueComment.mjs TEAM-NUM [body]  (e.g. NEW-106)');
  process.exit(1);
}

const bodyFromArg = process.argv.slice(3).join(' ').trim();
const bodyFromStdin =
  !bodyFromArg && !process.stdin.isTTY
    ? fs.readFileSync(0, 'utf8').trim()
    : '';
const body = bodyFromArg || bodyFromStdin;
if (!body) {
  console.error('Provide comment body as argv or stdin.');
  process.exit(1);
}

const dash = ident.lastIndexOf('-');
const teamKey = ident.slice(0, dash);
const number = parseInt(ident.slice(dash + 1), 10);

async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: key,
    },
    body: JSON.stringify({ query, variables }),
  });
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error('Linear API non-JSON response', res.status, raw.slice(0, 500));
    process.exit(1);
  }
  if (!res.ok) {
    console.error('Linear API HTTP', res.status, JSON.stringify(json, null, 2));
    process.exit(1);
  }
  if (json.errors?.length) {
    console.error(JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  return json.data;
}

/** Resolve issue UUID via team key + number (two-step; avoids flaky nested team filters). */
async function findIssue(teamKeyStr, num) {
  const teamsData = await gql(
    `query ($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 5) {
        nodes { id key name }
      }
    }`,
    { key: teamKeyStr }
  );
  let team = teamsData.teams.nodes[0];
  if (!team && teamKeyStr !== teamKeyStr.toUpperCase()) {
    const retry = await gql(
      `query ($key: String!) {
        teams(filter: { key: { eq: $key } }, first: 5) {
          nodes { id key name }
        }
      }`,
      { key: teamKeyStr.toUpperCase() }
    );
    team = retry.teams.nodes[0];
  }
  if (!team) {
    console.error(
      `No team with key "${teamKeyStr}". Check the key (e.g. NEW) and that this API key is for the same Linear workspace.`
    );
    process.exit(1);
  }

  const issuesData = await gql(
    `query ($teamId: ID!, $num: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $num } }, first: 1) {
        nodes { id identifier title }
      }
    }`,
    { teamId: team.id, num: num }
  );

  return issuesData.issues.nodes[0];
}

const issue = await findIssue(teamKey, number);
if (!issue) {
  console.error(`No issue ${ident} on team ${teamKey} (number ${number}).`);
  process.exit(1);
}

const created = await gql(
  `mutation ($issueId: String!, $body: String!) {
    commentCreate(input: { issueId: $issueId, body: $body }) {
      success
      comment { id }
    }
  }`,
  { issueId: issue.id, body }
);

if (!created.commentCreate.success) {
  console.error('commentCreate did not succeed:', created);
  process.exit(1);
}

console.log(`Comment on ${issue.identifier} (${issue.title}): ${created.commentCreate.comment.id}`);
