import { authTest, listConversations, SlackConversation } from './slackApi.ts';
import { loadSlackEnv } from './slackEnv.ts';

async function probeChannel(channelId: string): Promise<Record<string, unknown>> {
  try {
    const conversations = await listConversations({
      exclude_archived: true,
      limit: 1000,
      types: 'public_channel,private_channel,mpim,im',
    });

    if (!conversations.ok) {
      return {
        ok: false,
        channel_id: channelId,
        error: conversations.error ?? 'unknown_error',
      };
    }

    const channel = conversations.channels?.find((candidate: SlackConversation) => candidate.id === channelId);
    if (!channel) {
      return {
        ok: false,
        channel_id: channelId,
        visible: false,
        error: 'channel_not_visible',
      };
    }

    return {
      ok: true,
      channel_id: channel.id,
      name: channel.name,
      visible: true,
      is_member: channel.is_member,
    };
  } catch (error) {
    return {
      ok: false,
      channel_id: channelId,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main(): Promise<void> {
  const env = loadSlackEnv();
  const auth = await authTest();
  if (!auth.ok) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          auth: {
            ok: false,
            error: auth.error ?? 'unknown_error',
          },
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const configuredChannel = env.SLACK_CHANNEL_ID || env.CHANNEL_ID;
  const channel_probe = configuredChannel ? await probeChannel(configuredChannel) : undefined;

  console.log(
    JSON.stringify(
      {
        ok: true,
        team: {
          name: auth.team,
          id: auth.team_id,
          url: auth.url,
        },
        bot: {
          user: auth.user,
          user_id: auth.user_id,
          bot_id: auth.bot_id,
        },
        channel_probe,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
