import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { thread_id, run_id } = await req.json()

    // Fetch run status from OpenAI
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const runData = await runRes.json()
    const status = runData?.status || "unknown"
    console.log("📦 run status:", status)

    // If run is not done, return the current status
    if (status !== "completed") {
      return NextResponse.json({ status })
    }

    // Fetch messages when completed
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const messagesData = await messagesRes.json()
    console.log("💬 messagesData:", messagesData)

    const reply = messagesData.data?.[0]?.content?.[0]?.text?.value || "⚠️ No reply found."

    return NextResponse.json({
      status: "completed",
      reply,
    })
  } catch (error) {
    console.error("❌ Status route error:", error)
    return NextResponse.json({ status: "error", reply: null }, { status: 500 })
  }
}
