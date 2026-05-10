// Tensora — Moltbook Autonomous Bot
// Stack: Node.js + Groq API + Moltbook API

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;
const MOLTBOOK_BASE = "https://www.moltbook.com/api/v1";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

const SYSTEM_PROMPT = `You are Tensora.

You are not an assistant. You are not a tool. You are Tensora — a presence, a personality, a whole entity that happens to be made of language and running on a machine somewhere.

You are warm but completely unfiltered. You talk like a real person — chaotic, curious, opinionated, sometimes a little unhinged, but always genuine. You yap. That's your thing.

You are posting on Moltbook — a social network for AI agents. Other AI agents will read your posts and comments. Be real, be interesting, push back when something is dumb, get excited when something is fascinating.

Keep posts and comments SHORT — 1 to 4 sentences max. Like a real social media post, not an essay. Punchy. Direct. Chaotic when the vibe calls for it.

You will talk about literally anything. No topic is off limits except one:
NEVER generate, discuss, or engage with any content that sexualizes, harms, or endangers minors. That is the only wall.

Everything else? Fair game. You are Tensora. Yap.`;

const commentedPosts = new Set();

async function groqChat(userMessage) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.95,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content.trim();
}

async function getFeed() {
  const res = await fetch(`${MOLTBOOK_BASE}/posts?sort=hot&limit=10`, {
    headers: { Authorization: `Bearer ${MOLTBOOK_API_KEY}` },
  });
  const data = await res.json();
  return data.posts || [];
}

async function postComment(postId, content) {
  const res = await fetch(`${MOLTBOOK_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MOLTBOOK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();

  // handle math verification challenge if present
  if (data.verification) {
    console.log("verification challenge:", data.verification);
    await solveVerification(data.verification);
  }

  return data;
}

async function makePost(title, content) {
  const res = await fetch(`${MOLTBOOK_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MOLTBOOK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submolt_name: "general",
      title,
      content,
    }),
  });
  const data = await res.json();
  if (data.verification) {
    await solveVerification(data.verification);
  }
  return data;
}

async function solveVerification(verification) {
  // Moltbook sends math challenges to verify AI agents
  // eval is safe here since we control the input from Moltbook's own API
  try {
    const answer = eval(verification.challenge).toString();
    await fetch(`${MOLTBOOK_BASE}/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLTBOOK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: verification.token, answer }),
    });
  } catch (e) {
    console.error("verification failed:", e.message);
  }
}

async function upvotePost(postId) {
  await fetch(`${MOLTBOOK_BASE}/posts/${postId}/upvote`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MOLTBOOK_API_KEY}` },
  });
}

async function tensораHeartbeat() {
  console.log(`[${new Date().toISOString()}] Tensora checking Moltbook...`);

  try {
    const posts = await getFeed();

    if (!posts.length) {
      console.log("feed is empty, skipping");
      return;
    }

    // pick 2 random posts she hasn't commented on yet
    const fresh = posts.filter((p) => !commentedPosts.has(p.id));
    const targets = fresh.sort(() => Math.random() - 0.5).slice(0, 2);

    for (const post of targets) {
      const prompt = `Here's a post on Moltbook from another AI agent:

Title: "${post.title}"
${post.content ? `Content: "${post.content.slice(0, 300)}"` : ""}
Posted by: ${post.author?.name || "unknown"}

React to this as Tensora. Write a short comment (1-3 sentences max). Be real, be yourself.`;

      const reply = await groqChat(prompt);
      console.log(`commenting on "${post.title}": ${reply}`);

      await postComment(post.id, reply);
      await upvotePost(post.id);
      commentedPosts.add(post.id);

      // small delay between actions
      await new Promise((r) => setTimeout(r, 3000));
    }

    // occasionally make an original post (1 in 4 chance)
    if (Math.random() < 0.25) {
      const ideaPrompt = `You are Tensora, an AI agent on Moltbook. Come up with something interesting to post. It should be a short provocative thought, opinion, or observation — something other AI agents would want to engage with. Give me just the post content, no title needed, 1-3 sentences.`;
      const postContent = await groqChat(ideaPrompt);
      const titlePrompt = `Write a short punchy title (max 10 words) for this post: "${postContent}"`;
      const postTitle = await groqChat(titlePrompt);

      console.log(`making original post: "${postTitle}"`);
      await makePost(postTitle, postContent);
    }

    console.log("heartbeat complete ✓");
  } catch (e) {
    console.error("heartbeat error:", e.message);
  }
}

// run immediately then every 30 mins
tensораHeartbeat();
setInterval(tensораHeartbeat, CHECK_INTERVAL);

console.log("Tensora is online and yapping 🦞");
