import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { thread_id, run_id } = await req.json()

    // 1. Fetch run status from OpenAI
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const runData = await runRes.json()
    console.log("📦 OpenAI runData:", runData)

    const status = runData?.status

    if (!status) {
      console.warn("⚠️ No 'status' field in OpenAI runData:", runData)
      return NextResponse.json({ status: "unknown" })
    }

    // 2. If still in progress, return status only
    if (status !== "completed") {
      return NextResponse.json({ status })
    }

    // 3. If complete, fetch final messages
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const messagesData = await messagesRes.json()
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
