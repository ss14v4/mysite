--- src/components/os/ArticleWin.tsx (原始)


+++ src/components/os/ArticleWin.tsx (修改后)
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useOS } from "./ctx";
import { useCMS } from "../../lib/cms";
import type { CmsPost } from "../../lib/cms";

/* ——— markdown-lite inline renderer ——— */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={k++} className="font-bold text-[var(--txt)]">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k++} className="border border-[var(--line2)] bg-[var(--bg2)] px-1 text-[0.92em] text-[var(--acc)]">{tok.slice(1, -1)}</code>);
    else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (mm) out.push(<a key={k++} href={mm[2]} target="_blank" rel="noreferrer" className="alink text-[var(--cyan)] underline decoration-dotted underline-offset-2">{mm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ——— embedded feedback form (guest-friendly: hands a note to the inbox) ——— */
function PostForm({ post }: { post: CmsPost }) {
  const cms = useCMS();
  const os = useOS();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const send = () => {
    if (!email.trim() || !msg.trim()) { os.toast("FORM NEEDS EMAIL + MESSAGE"); return; }
    const subject = encodeURIComponent(`[blog] ${post.title} — reply from ${email}`);
    const body = encodeURIComponent(`${msg}\n\n— sent from blog.md / ${post.title}\nreply-to: ${email}`);
    window.location.href = `mailto:${cms.profile.handle}?subject=${subject}&body=${body}`;
    os.toast("MESSAGE HANDED TO MAIL CLIENT");
  };
  return (
    <div className="my-4 border border-[var(--line2)] bg-[var(--panel2)] p-3">
      <div className="mb-2 font-mono2 text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--acc)]">
        ✉ feedback uplink · embedded via {"{{form}}"}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.tld" type="email"
          className="border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[11px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
        <button onClick={send}
          className="border border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-1.5 font-mono2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--acc)] transition-colors hover:bg-[var(--acc)] hover:text-[var(--bg)]">
          transmit →
        </button>
      </div>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="what did this post break in your head?"
        className="mt-2 w-full resize-none border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[11px] leading-relaxed text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
    </div>
  );
}

/* ——— block renderer ——— */
export function PostBody({ post, onImage }: { post: CmsPost; onImage: (i: number) => void }) {
  const lines = post.body.split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  let k = 0;
  const flush = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={k++} className="my-2 space-y-1">
        {list.map((li, i) => (
          <li key={i} className="flex gap-2 text-[var(--dim)]"><span className="text-[var(--acc)]">▸</span><span>{inline(li)}</span></li>
        ))}
      </ul>
    );
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) { list.push(line.slice(2)); continue; }
    flush();
    if (!line.trim()) { nodes.push(<div key={k++} className="h-2" />); continue; }
    if (line.startsWith("### ")) nodes.push(<h3 key={k++} className="mt-4 font-mono2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--cyan)]">{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) nodes.push(<h2 key={k++} className="mt-5 font-mono2 text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]">## {inline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) nodes.push(<h1 key={k++} className="font-disp text-[26px] leading-tight tracking-wide text-[var(--txt)]" style={{ textShadow: "0 0 20px var(--acc-glow)" }}>{line.slice(2)}</h1>);
    else if (line.startsWith("> ")) nodes.push(<blockquote key={k++} className="my-2 border-l-2 border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-2 text-[11.5px] italic text-[var(--txt)]">{inline(line.slice(2))}</blockquote>);
    else if (/^-{3,}$/.test(line)) nodes.push(<div key={k++} className="my-3 h-px bg-[var(--line2)]" />);
    else if (/^!\[\d+\]$/.test(line)) {
      const idx = Number(line.slice(2, -1));
      const src = post.images[idx];
      if (src) {
        nodes.push(
          <button key={k++} onClick={() => onImage(idx)} className="img-scan group my-3 block w-full overflow-hidden border border-[var(--line2)] text-left">
            <img src={src} alt={`${post.title} — figure ${idx}`} loading="lazy" className="max-h-52 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="block px-2 py-1 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">fig.{idx} · click to expand</span>
          </button>
        );
      }
    } else if (line === "{{form}}") nodes.push(<PostForm key={k++} post={post} />);
    else nodes.push(<p key={k++} className="text-[var(--dim)]">{inline(line)}</p>);
  }
  flush();
  return <div className="space-y-1">{nodes}</div>;
}

/* ——— the reader window ——— */
export default function ArticleWin() {
  const os = useOS();
  const cms = useCMS();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const posts = cms.blog.posts;
  const idx = posts.findIndex((p) => p.id === os.selPost);
  const post = idx >= 0 ? posts[idx] : posts[0] ?? null;

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (post && e.key === "ArrowRight") setLightbox((l) => (l === null ? l : (l + 1) % post.images.length));
      if (post && e.key === "ArrowLeft") setLightbox((l) => (l === null ? l : (l + post.images.length - 1) % post.images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, post]);

  if (!post) {
    return <div className="grid h-full place-items-center font-mono2 text-[11px] text-[var(--faint)]">~/blog — file not found</div>;
  }

  return (
    <div className="flex h-full flex-col font-mono2 text-[12px]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-4 py-2 text-[10px]">
        <button onClick={() => os.open("blog", { center: true })} className="frow border border-[var(--line2)] px-2 py-0.5 text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ← cd ~/blog
        </button>
        <span className="truncate text-[var(--acc)]">~/blog/{post.title}.md</span>
        {posts.length > 1 && (
          <span className="ml-auto flex items-center gap-1">
            <button onClick={() => os.openArticle(posts[(idx + posts.length - 1) % posts.length].id)} className="pbtn" title="previous post">‹</button>
            <span className="text-[9px] text-[var(--faint)]">{idx + 1}/{posts.length}</span>
            <button onClick={() => os.openArticle(posts[(idx + 1) % posts.length].id)} className="pbtn" title="next post">›</button>
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <PostBody post={post} onImage={setLightbox} />
        <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] pt-3">
          <span className="text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">tags:</span>
          {post.tags.map((t) => (
            <span key={t} className="border border-[var(--line2)] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">#{t}</span>
          ))}
          <span className="ml-auto text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">{post.date}</span>
        </div>
      </div>

      {lightbox !== null && post.images[lightbox] && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(2,5,3,0.92)] p-6 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="tick-up relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={post.images[lightbox]} alt={`${post.title} — figure ${lightbox}`} className="max-h-[80vh] w-auto border border-[var(--acc)] shadow-[0_0_60px_var(--acc-glow)]" />
            <div className="mt-2 flex items-center justify-between font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]">
              <span>fig.{lightbox} · esc / click outside to close</span>
              {post.images.length > 1 && (
                <span className="flex items-center gap-2">
                  <button onClick={() => setLightbox((lightbox + post.images.length - 1) % post.images.length)} className="pbtn">←</button>
                  <span>{lightbox + 1}/{post.images.length}</span>
                  <button onClick={() => setLightbox((lightbox + 1) % post.images.length)} className="pbtn">→</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
