import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    // 1. Create a new thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const { id: thread_id } = await threadRes.json()

    // 2. Add the user's message to the thread
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
    })

    // 3. Start the assistant run (no file_ids needed!)
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: process.env.OPENAI_ASSISTANT_ID,
      }),
    })

    const { id: run_id } = await runRes.json()

    return NextResponse.json({ thread_id, run_id })
  } catch (error) {
    console.error("❌ Init route error:", error)
    return NextResponse.json({ error: "Assistant init failed" }, { status: 500 })
  }
}
