"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/Sidebar";
import MessageComponent from "@/components/Message";
import ChatInput from "@/components/ChatInput";
import { Conversation, Message } from "@/types";
import {
	saveConversation,
	getConversations,
	deleteConversation,
} from "@/lib/storage";

export default function Home() {
	const [conversations, setConversations] = useState<
		Record<string, Conversation>
	>({});
	const [currentId, setCurrentId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [settings, setSettings] = useState({
		temperature: 0.7,
		maxOutputTokens: 4096,
		systemMessage: "You are a knowledgeable and articulate AI assistant...",
	});

	useEffect(() => {
		setConversations(getConversations());
	}, []);

	const handleNewChat = () => {
		const newId = uuidv4();
		const newConversation: Conversation = {
			id: newId,
			title: "New Chat",
			messages: [],
			createdAt: new Date().toISOString(),
		};

		setConversations((prev) => ({
			...prev,
			[newId]: newConversation,
		}));
		setCurrentId(newId);
		saveConversation(newConversation);
	};

	const handleDeleteConversation = (id: string) => {
		const updatedConversations = { ...conversations };
		delete updatedConversations[id];
		setConversations(updatedConversations);
		deleteConversation(id);

		if (currentId === id) {
			// If we're deleting the current conversation, set currentId to null
			// or to the most recent conversation if one exists
			const remainingIds = Object.keys(updatedConversations);
			if (remainingIds.length > 0) {
				// Get the most recent conversation
				const mostRecentId = remainingIds.sort(
					(a, b) =>
						new Date(updatedConversations[b].createdAt).getTime() -
						new Date(updatedConversations[a].createdAt).getTime(),
				)[0];
				setCurrentId(mostRecentId);
			} else {
				setCurrentId(null);
			}
		}
	};

	const handleSettingsChange = (newSettings: typeof settings) => {
		setSettings(newSettings);
	};

	const handleSendMessage = async (content: string) => {
		if (!content.trim()) return;

		let activeId = currentId;
		let currentConversation: Conversation;

		// Always create a new chat if there isn't one
		if (!currentId) {
			const newId = uuidv4();
			currentConversation = {
				id: newId,
				title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
				messages: [],
				createdAt: new Date().toISOString(),
			};

			setConversations((prev) => ({
				...prev,
				[newId]: currentConversation,
			}));
			setCurrentId(newId);
			saveConversation(currentConversation);
			activeId = newId;
		} else {
			currentConversation = conversations[currentId];
		}

		setIsLoading(true);
		const messageId = uuidv4();
		const userMessage: Message = {
			id: messageId,
			content,
			role: "user",
		};

		// Get current conversation
		const updatedConv = {
			...currentConversation,
			messages: [...currentConversation.messages, userMessage],
		};

		// Update title if it's the first message
		if (updatedConv.messages.length === 1) {
			updatedConv.title =
				content.slice(0, 30) + (content.length > 30 ? "..." : "");
		}

		// Update UI immediately with user message
		setConversations((prev) => ({
			...prev,
			[activeId as string]: updatedConv,
		}));
		saveConversation(updatedConv);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content: settings.systemMessage,
						},
						...updatedConv.messages.map((msg) => ({
							role: msg.role,
							content: msg.content,
						})),
					],
					prompt: content,
					settings: {
						temperature: settings.temperature,
						maxOutputTokens: settings.maxOutputTokens,
					},
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");

			const reader = response.body?.getReader();
			if (!reader) throw new Error("No response reader");

			const decoder = new TextDecoder();
			let assistantContent = "";
			const assistantMessage: Message = {
				id: uuidv4(),
				content: "",
				role: "assistant",
			};

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							if (data.text) {
								assistantContent += data.text;
								assistantMessage.content = assistantContent;

								// Update conversation in real-time
								const realtimeConv = {
									...updatedConv,
									messages: [...updatedConv.messages, { ...assistantMessage }],
								};
								setConversations((prev) => ({
									...prev,
									[activeId as string]: realtimeConv,
								}));
							}
						} catch (e) {
							console.error("Error parsing chunk:", e);
						}
					}
				}
			}

			const finalConversation = {
				...updatedConv,
				messages: [...updatedConv.messages, assistantMessage],
			};

			setConversations((prev) => ({
				...prev,
				[activeId as string]: finalConversation,
			}));
			saveConversation(finalConversation);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex h-screen bg-gray-900 overflow-hidden">
			<div
				className={`flex flex-shrink-0 transition-all duration-300 relative ${isSidebarOpen ? "w-80" : "w-0"}`}
			>
				<Sidebar
					conversations={conversations}
					currentId={currentId}
					onSelect={setCurrentId}
					onNew={handleNewChat}
					onDelete={handleDeleteConversation}
					onSettingsChange={handleSettingsChange}
					className={`${isSidebarOpen ? "w-full" : "w-0 hidden"}`}
				/>
				<button
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className={`absolute top-4 ${isSidebarOpen ? "right-2" : "left-2"} p-2 hover:bg-white/5 rounded-lg transition-colors z-50 bg-gray-800/50`}
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
						/>
					</svg>
				</button>
			</div>

			<div className="flex-1 flex flex-col items-center bg-gray-900">
				<div className="w-full max-w-4xl flex-1 flex flex-col h-full">
					<div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
						{currentId && conversations[currentId]?.messages.length > 0 ? (
							conversations[currentId]?.messages.map((message) => (
								<MessageComponent
									key={message.id}
									content={message.content}
									role={message.role}
									onCopy={() => navigator.clipboard.writeText(message.content)}
								/>
							))
						) : (
							<div className="h-full flex flex-col items-center justify-center text-gray-400">
								<h2 className="text-2xl font-semibold mb-2">
									Welcome to Chat with Gemini! 👋
								</h2>
								<p className="text-lg">What can I help you with today?</p>
							</div>
						)}
					</div>
					<div className="w-full">
						<ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
					</div>
				</div>
			</div>
		</main>
	);
}
