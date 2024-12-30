import React, { useState, useEffect } from "react";
import { supabase } from "../../netlify/functions/supabaseClient.mjs";
import { useNavigate } from "react-router-dom";

const ThreadList = () => {
  const [threads, setThreads] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadDescription, setThreadDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const addThread = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // スレッド作成
      const { data, error } = await supabase
        .from("threads")
        .insert([{ title: threadTitle, description: threadDescription }])
        .select();

      if (error) {
        console.error(error);
        return;
      }

      // 新しいスレッドIDを取得
      const newThread = data[0];

      // スレッド作成後にその説明を最初の投稿として追加
      const { error: postError } = await supabase.from("posts").insert([
        {
          content: threadDescription,  // 説明を最初の投稿内容として使用
          thread_id: newThread.id,
        },
      ]);

      if (postError) {
        console.error("Error adding post:", postError);
        return;
      }

      setThreadTitle("");
      setThreadDescription("");
      navigate(`/threads/${newThread.id}`);
    } finally {
      setLoading(false);
    }
  };

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
        fetchThreads();
      }
    } catch (error) {
      console.error("Unexpected error deleting thread:", error);
    }
  };

  return (
    <div>
      {/* 7chのタイトル */}
      <div className="header">7ch</div>

      <div className="container">
        {/* スレッド一覧 */}
        <div className="thread-list">
          <h2>スレッド一覧</h2>
          {threads.map((thread) => (
            <div key={thread.id}>
              <h3>{thread.title}</h3>
              <p>{thread.description}</p>
              <button onClick={() => navigate(`/threads/${thread.id}`)}>スレッドに移動</button>
              <button onClick={() => deleteThread(thread.id)}>スレッドを削除</button>
            </div>
          ))}
        </div>

        {/* スレッド作成フォーム */}
        <div className="thread-form">
          <h2>新しいスレッドを作成</h2>
          <form onSubmit={addThread}>
            <input
              type="text"
              placeholder="スレッドタイトル"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="スレッドの説明（自動的にここに打ち込んだ文章が最初の投稿になります）"
              value={threadDescription}
              onChange={(e) => setThreadDescription(e.target.value)}
            ></textarea>
            <button type="submit" disabled={loading}>
              {loading ? "作成中..." : "スレッド作成"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThreadList;
