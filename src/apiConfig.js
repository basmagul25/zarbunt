// Backend (server) ka address.
//
// Computer par:  http://localhost:5000
// Live website par: Vercel ke Environment Variable VITE_API_URL se aata hai
//                   (jaise https://zarbunt-api.onrender.com)
export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");