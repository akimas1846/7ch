// ThreadList.js
import React, { useState, useEffect } from "react";
import { supabase } from "../../netlify/functions/supabaseClient.mjs";
import { useNavigate } from "react-router-dom";

const ThreadList = () => {
  const [threads, setThreads] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadDescription, setThreadDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch threads
  const fetchThreads = async () => {
    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching threads:", error);
    } else {
      setThreads(data);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // Add a new thread
  const addThread = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("threads")
        .insert([{ title: threadTitle, description: threadDescription }])
        .select();

      if (error) {
        console.error(error);
      } else {
        setThreadTitle("");
        setThreadDescription("");
        const newThread = data[0];
        navigate(`/threads/${newThread.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a thread
  const deleteThread = async (threadId) => {
    const confirmDelete = window.confirm(
      "このスレッドを削除してもよろしいですか？この操作は取り消せません。"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("threads")
        .delete()
        .eq("id", threadId);
      if (error) {
        console.error("Error deleting thread:", error);
      } else {
        // 削除成功後、スレッドリストを再フェッチ
        fetchThreads();
      }
    } catch (error) {
      console.error("Unexpected error deleting thread:", error);
    }
  };

  return (
    <div>
      <h1>スレッド一覧</h1>
      {/* スレッド作成フォーム */}
      <form onSubmit={addThread}>
        <input
          type="text"
          placeholder="スレッドタイトル"
          value={threadTitle}
          onChange={(e) => setThreadTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="スレッドの説明"
          value={threadDescription}
          onChange={(e) => setThreadDescription(e.target.value)}
        ></textarea>
        <button type="submit" disabled={loading}>
          {loading ? "作成中..." : "スレッド作成"}
        </button>
      </form>

      {/* スレッド一覧表示 */}
      <div>
        {threads.map((thread) => (
          <div key={thread.id}>
            <h2>{thread.title}</h2>
            <p>{thread.description}</p>
            <button onClick={() => navigate(`/threads/${thread.id}`)}>
              詳細を見る
            </button>
            <button onClick={() => deleteThread(thread.id)}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadList;
