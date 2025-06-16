import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const threadRes = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const { id: thread_id } = await threadRes.json();

  await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "user",
      content: prompt,
    }),
  });

  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
      file_ids: [process.env.OPENAI_FILE_ID],
    }),
  });

  const { id: run_id } = await runRes.json();

  let status = "queued";
  while (status !== "completed" && status !== "failed") {
    await new Promise((r) => setTimeout(r, 2000));
    const runStatus = await fetch(
      `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    const runData = await runStatus.json();
    status = runData.status;
  }

  const messages = await fetch(
    `https://api.openai.com/v1/threads/${thread_id}/messages`,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const { data } = await messages.json();
  const reply = data?.[0]?.content?.[0]?.text?.value || "No reply found.";

  return NextResponse.json({ reply });
}
