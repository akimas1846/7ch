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

  // ページ設定
  const postsPerPage = 5; // 1ページに表示する投稿数
  const [currentPage, setCurrentPage] = useState(1);

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
          .eq("thread_id", id)
          .range(
            (currentPage - 1) * postsPerPage,
            currentPage * postsPerPage - 1
          ); // ページごとに投稿を取得

        if (postsError) {
          console.error("Error fetching posts:", postsError);
        } else {
          setPosts(postsData);
        }

        // コメントは posts.post_id に基づいて取得
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .in(
            "post_id",
            postsData.map((post) => post.id)
          ); // postsData の post_id に基づいてコメントを取得

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
  }, [id, currentPage]);

  // 投稿数を取得してページ数を計算
  const [totalPosts, setTotalPosts] = useState(0);
  useEffect(() => {
    const fetchTotalPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id", { count: "exact" })
          .eq("thread_id", id);

        if (error) {
          console.error("Error fetching total posts:", error);
        } else {
          setTotalPosts(data.length); // 総投稿数を更新
        }
      } catch (error) {
        console.error("Error fetching total posts:", error);
      }
    };

    fetchTotalPosts();
  }, [id]);

  // ページ遷移を制御
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
        window.location.reload();
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
          post_id: postId,
        },
      ]);

      if (error) {
        console.error("Error adding comment:", error);
      } else {
        window.location.reload();
        // setNewCommentContent(""); // コメント内容をリセット
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId);
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
      <div className="header">7ch</div>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="thread-detail-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            戻る
          </button>
          <h1 className="thread-title">
            {thread ? thread.title : "スレッドが見つかりませんでした"}
          </h1>

          {/* 投稿一覧表示 */}
          <div className="post-list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="post">
                  <p>{post.content}</p>
                  <small>
                    投稿日: {new Date(post.created_at).toLocaleString()}
                  </small>
                  <button onClick={() => deletePost(post.id)}>
                    投稿を削除
                  </button>

                  {/* コメントフォーム */}
                  <button onClick={() => setSelectedPostId(post.id)}>
                    コメントする
                  </button>

                  {selectedPostId === post.id && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault(); // フォーム送信を無効化
                        if (!newCommentContent) {
                          setSelectedPostId(null); // フォームを閉じる
                        } else {
                          addComment(e, post.id);
                        }
                      }}
                      className="comment-form"
                    >
                      <textarea
                        placeholder="コメントを追加..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                      ></textarea>
                      <button type="submit">
                        {newCommentContent
                          ? "コメントを投稿する"
                          : "投稿をキャンセル"}
                      </button>
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

          {/* ページ遷移ボタン */}
          <div className="pagination">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              前へ
            </button>
            <span>
              ページ {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              次へ
            </button>
          </div>

          {/* 投稿フォーム */}
          <div className="post-form">
            <form onSubmit={addPost}>
              <textarea
                placeholder="新しい投稿..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              ></textarea>
              <button type="submit">投稿する</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadDetail;
