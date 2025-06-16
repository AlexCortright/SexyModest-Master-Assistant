import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { thread_id, run_id } = await req.json()
    console.log("📥 Status check: thread_id =", thread_id, "| run_id =", run_id)

    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const runData = await runRes.json()
    console.log("📦 runData from OpenAI:", runData)

    const status = runData?.status || "unknown"

    if (status !== "completed") {
      return NextResponse.json({ status })
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread_id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const messagesData = await messagesRes.json()
    const reply = messagesData.data?.[0]?.content?.[0]?.text?.value || "⚠️ No reply found."

    return NextResponse.json({ status: "completed", reply })
  } catch (error) {
    console.error("❌ Error in status route:", error)
    return NextResponse.json({ status: "error", reply: null }, { status: 500 })
  }
}
