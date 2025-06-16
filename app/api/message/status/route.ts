import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { thread_id, run_id } = await req.json()

    const runCheck = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const runData = await runCheck.json()

    if (runData.status !== "completed") {
      return NextResponse.json({ status: runData.status })
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const messagesData = await messagesRes.json()
    const reply = messagesData.data?.[0]?.content?.[0]?.text?.value || null

    return NextResponse.json({
      status: "completed",
      reply,
    })
  } catch (error) {
    console.error("❌ Status route error:", error)
    return NextResponse.json({ status: "error", reply: null }, { status: 500 })
  }
}
