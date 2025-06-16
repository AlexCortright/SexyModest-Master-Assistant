import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const threadData = await threadRes.json()
    const thread_id = threadData.id

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
    })

    const { id: run_id } = await runRes.json()

    let status = "queued"
    while (status !== "completed" && status !== "failed") {
      await new Promise((r) => setTimeout(r, 2000))
      const runCheck = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
      const runData = await runCheck.json()
      status = runData.status
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const messagesData = await messagesRes.json()
    const reply = messagesData.data?.[0]?.content?.[0]?.text?.value || "No reply found."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
