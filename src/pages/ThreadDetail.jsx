import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../netlify/functions/supabaseClient.mjs";

const ThreadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // スレッド、投稿、コメントをフェッチ
  useEffect(() => {
    const fetchThread = async () => {
      if (!id) {
        console.error("Thread ID is undefined.");
        return;
      }

      try {
        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("*")
          .eq("id", id)
          .single();

        if (threadError) {
          console.error("Error fetching thread:", threadError);
        } else {
          setThread(threadData);
        }

        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("thread_id", id);

        if (postsError) {
          console.error("Error fetching posts:", postsError);
        } else {
          setPosts(postsData);
        }

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("thread_id", id); // スレッドIDでコメントを取得

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
        } else {
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [id]);

  // 新しい投稿を追加する
  const addPost = async (e) => {
    e.preventDefault();
    if (!newPostContent) return;

    try {
      const { error } = await supabase.from("posts").insert([
        {
          content: newPostContent,
          thread_id: id,
        },
      ]);

      if (error) {
        console.error("Error adding post:", error);
      } else {
        setNewPostContent(""); // 投稿内容をリセット
        // 投稿リストの再取得
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("thread_id", id);
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Unexpected error adding post:", error);
    }
  };

  // 新しいコメントを追加する
  const addComment = async (e, postId) => {
    e.preventDefault();

    if (!newCommentContent) return;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          content: newCommentContent,
          post_id: postId, // ここで postId を渡す
        },
      ]);

      if (error) {
        console.error("Error adding comment:", error);
      } else {
        setNewCommentContent(""); // コメント内容をリセット
        // コメントリストの再取得
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId); // コメントを投稿IDで取得
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Unexpected error adding comment:", error);
    }
  };

  // 投稿を削除する
  const deletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "この投稿を削除してもよろしいですか？この操作は取り消せません。"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        console.error("Error deleting post:", error);
      } else {
        // 投稿削除後に再フェッチ
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("thread_id", id);
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Unexpected error deleting post:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div>
          <h1>{thread ? thread.title : "スレッドが見つかりませんでした"}</h1>
          <button onClick={() => navigate(-1)}>戻る</button>

          {/* 投稿フォーム */}
          <form onSubmit={addPost}>
            <textarea
              placeholder="新しい投稿..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            ></textarea>
            <button type="submit">投稿する</button>
          </form>

          {/* 投稿一覧表示 */}
          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id}>
                  <p>{post.content}</p>
                  <small>
                    投稿日: {new Date(post.created_at).toLocaleString()}
                  </small>
                  <button onClick={() => deletePost(post.id)}>削除</button>

                  {/* コメントフォーム */}
                  <button onClick={() => setSelectedPostId(post.id)}>
                    コメントする
                  </button>

                  {selectedPostId === post.id && (
                    <form onSubmit={(e) => addComment(e, post.id)}>
                      <textarea
                        placeholder="コメントを追加..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        required
                      ></textarea>
                      <button type="submit">コメントする</button>
                    </form>
                  )}

                  {/* コメント表示 */}
                  {comments
                    .filter((comment) => comment.post_id === post.id)
                    .map((comment) => (
                      <div key={comment.id} style={{ marginLeft: "20px" }}>
                        <p>{comment.content}</p>
                        <small>
                          コメント投稿日:{" "}
                          {new Date(comment.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <p>まだ投稿はありません。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadDetail;
