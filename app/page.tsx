"use client"

import type React from "react"

import { useChat } from "ai/react"
import { Send, Bot, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const scrollToBottom = (force = false) => {
    if (shouldAutoScroll || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Enhanced auto-scroll effect
  useEffect(() => {
    scrollToBottom(true)
  }, [messages])

  // Track if user is near bottom to determine auto-scroll behavior
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100
    setShouldAutoScroll(isNearBottom)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // On desktop: Enter submits, Shift+Enter or Cmd+Enter adds new line
    // On mobile: Enter adds new line, Send button submits
    const isMobile = window.innerWidth < 768
    const isDesktop = !isMobile

    if (e.key === "Enter") {
      if (isDesktop && !e.shiftKey && !e.metaKey) {
        // Desktop: Enter submits (unless Shift or Cmd is held)
        e.preventDefault()
        if (input.trim()) {
          handleSubmit(e as any)
        }
      } else if (isMobile && (e.metaKey || e.ctrlKey)) {
        // Mobile: Cmd+Enter or Ctrl+Enter submits
        e.preventDefault()
        if (input.trim()) {
          handleSubmit(e as any)
        }
      }
      // Otherwise, allow default behavior (new line)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900 text-center">SexyModest Assistant</h1>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Hi! I'm your SexyModest Assistant.</p>
            <p className="text-sm">How can I help you today?</p>
            <p className="text-xs mt-4 text-gray-400">Press Enter to send • Shift+Enter for new line</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-2 max-w-[85%] ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[48px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors touch-manipulation"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
