// netlify/functions/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL または Key が設定されていません');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event) {
  const { httpMethod, body } = event;

  // スレッドの取得
  if (httpMethod === "GET" && event.path === "/api/threads") {
    try {
      const { data, error } = await supabase.from("threads").select("*");

      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ data }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }

  // 新しい投稿の追加
  if (httpMethod === "POST" && event.path === "/api/posts") {
    const { content, thread_id } = JSON.parse(body);
    try {
      const { data, error } = await supabase.from("posts").insert([
        { content, thread_id },
      ]);

      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ data }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
}
