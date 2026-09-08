import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { divic } from '../lib/divic-api';
import { useProperty } from '../context/PropertyContext';
import { SectionHead } from '../components/primitives';

/**
 * Questions about the house.
 *
 * The curated answers come first and do the real work: most people want the
 * check-in time, the address, or whether there is a pool, and a plain list
 * answers that instantly, costs nothing, and still works when the assistant is
 * unavailable. The assistant is the fallback for what the list does not cover.
 *
 * It is labelled as what it is. No name, no persona — a guest who believes they
 * have settled something with a member of staff, when they have not, becomes a
 * problem at the front desk.
 */
export default function Ask() {
  const { properties, propertyId } = useProperty();
  const [entries, setEntries] = useState(null);
  const [openKey, setOpenKey] = useState(null);

  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const threadEnd = useRef(null);

  useEffect(() => {
    const ac = new AbortController();
    divic
      .faq({ signal: ac.signal })
      .then(setEntries)
      .catch(() => setEntries([]));   // the page still works without them
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (thread.length) threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [thread]);

  const grouped = useMemo(() => {
    const out = {};
    (entries || []).forEach((e) => {
      (out[e.category || 'General'] = out[e.category || 'General'] || []).push(e);
    });
    return out;
  }, [entries]);

  const phone = properties.find((p) => p.id === propertyId)?.phone || properties[0]?.phone;

  async function ask(text) {
    const q = (text ?? question).trim();
    if (!q || busy) return;
    setQuestion('');
    setError(null);
    setBusy(true);
    setThread((t) => [...t, { role: 'you', text: q }]);
    try {
      const res = await divic.askFaq({ question: q, location: propertyId });
      setThread((t) => [...t, { role: 'house', text: res.answer }]);
    } catch (err) {
      // 429 comes back with wording already written for a guest to read.
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="shell pb-10 pt-40">
        <SectionHead
          title="Questions about the house"
          lead="Common answers are below. Ask anything else and we will answer from what the house has published."
        />
      </section>

      <section className="shell pb-section">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {entries === null && <p className="text-sm text-slate">Loading…</p>}

            {entries && entries.length === 0 && (
              <p className="prose-body">
                We have not published answers here yet. Please call the house and we will
                help you directly.
              </p>
            )}

            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-10">
                <p className="eyebrow">{category}</p>
                <div className="mt-4 flex flex-col">
                  {items.map((e) => {
                    const key = category + e.question;
                    const open = openKey === key;
                    return (
                      <div key={key} className="border-t border-ink/10">
                        <button
                          type="button"
                          onClick={() => setOpenKey(open ? null : key)}
                          aria-expanded={open}
                          className="flex w-full items-baseline justify-between gap-6 py-4 text-left transition-colors duration-400 hover:text-[rgb(var(--accent))]"
                        >
                          <span className="text-body">{e.question}</span>
                          <span aria-hidden="true" className="text-mute">{open ? '−' : '+'}</span>
                        </button>
                        {open && <p className="prose-body pb-5 text-sm">{e.answer}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-28 border-t border-ink/15 pt-6">
              <p className="eyebrow">Ask a question</p>
              <p className="mt-4 text-sm text-slate">
                Answered automatically from what the house has published. It cannot see
                your booking or check what is free.
              </p>

              {thread.length > 0 && (
                <div className="mt-6 flex flex-col gap-4">
                  {thread.map((m, i) => (
                    <div key={i}>
                      <p className="text-sm text-mute">{m.role === 'you' ? 'You' : 'The house'}</p>
                      <p className="prose-body mt-1 whitespace-pre-wrap text-sm">{m.text}</p>
                    </div>
                  ))}
                  <div ref={threadEnd} />
                </div>
              )}

              {busy && <p className="mt-4 text-sm text-slate">Looking that up…</p>}

              {error && (
                <p role="alert" className="mt-4 border-l-2 border-[#B4543A] py-2 pl-4 text-sm text-[#8C3A1E]">
                  {error}
                </p>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); ask(); }}
                className="mt-6 flex flex-col gap-3"
              >
                <textarea
                  rows={3}
                  maxLength={300}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Is there parking?"
                  className="w-full resize-none border-b border-ink/20 bg-transparent px-0 py-3 text-body text-ink placeholder:text-mute focus:border-[rgb(var(--accent))] focus:outline-none transition-colors duration-400"
                />
                <button type="submit" disabled={busy || !question.trim()} className="btn btn-outline disabled:opacity-40">
                  Ask
                </button>
              </form>

              {/* Someone using this at 11pm often has a question that needs a
                  person, so the number stays in view the whole time. */}
              {phone && (
                <p className="mt-8 text-sm text-slate">
                  Rather speak to someone?{' '}
                  <a href={`tel:${phone}`} className="underline underline-offset-4">{phone}</a>
                </p>
              )}
              <Link to="/booking-status" className="link-quiet mt-5">
                Check an existing booking
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
