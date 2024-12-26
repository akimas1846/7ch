
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/helo.mjs
var helo_default = async () => {
  const data = {
    message: "Hello, World!"
  };
  return new Response(JSON.stringify(data));
};
export {
  helo_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvaGVsby5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgIG1lc3NhZ2U6IFwiSGVsbG8sIFdvcmxkIVwiLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gIH07XHJcbiAgIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLElBQU8sZUFBUSxZQUFZO0FBQ3ZCLFFBQU0sT0FBTztBQUFBLElBQ1gsU0FBUztBQUFBLEVBQ1g7QUFDQSxTQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsSUFBSSxDQUFDO0FBQzFDOyIsCiAgIm5hbWVzIjogW10KfQo=
