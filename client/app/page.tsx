"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const createRoom = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room`,
      {
        method: "POST",
      }
    );
    const { roomId } = await response.json();
    router.push(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">P2P Video Call</h1>
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Create Room
          </button>
          <div className="flex space-x-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={joinRoom}
              className="bg-green-500 text-white p-2 rounded"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
