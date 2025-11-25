import Head from 'next/head';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';


function SubmitEvidence() {
  const [loading, setLoading] = useState(false);
    const handleSubmitEvidence = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const points = form.evidenceType.value;
        const actionName = form.evidenceType.options[form.evidenceType.selectedIndex].text;
        const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
        const fileInput = form.elements.namedItem("proofFile") as HTMLInputElement;
        const eventDate = (form.elements.namedItem("date") as HTMLInputElement).value;
        const file = fileInput.files?.[0];

        try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user)
      if (!user) throw new Error("You must be logged in.");

      let proofUrl = null;
      if (file) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("proofs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("proofs")
          .getPublicUrl(filePath);

        proofUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("user_actions")
        .insert({
          user_id: user.id,
          action_name: actionName,
          description: description,
          proof_photo_url: proofUrl,
          approved: false,
          points: parseInt(points),
          event_date: eventDate,
        });

      if (insertError) throw insertError;

      alert("Submission received!");
      form.reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-red-900/30 selection:text-white overflow-x-hidden">
          <Head>
            <title>Submit Evidence | Fight On-Chain</title>
          </Head>
          <Navbar variant="standard" />
      
          <main className="pt-32 pb-16 px-6 max-w-3xl mx-auto space-y-8">
            <header className="space-y-2 text-center">
              <p className="text-xs font-mono tracking-[0.3em] text-red-500 uppercase">Submit Proof</p>
              <h1 className="text-4xl font-serif text-white">Submit Evidence</h1>
              <p className="text-sm text-neutral-500">Upload proof of attendance to earn reputation.</p>
            </header>
      
        <form onSubmit={handleSubmitEvidence} className="space-y-5 p-6 rounded-2xl bg-[#111] border border-white/5 shadow-black/40 shadow-lg">
          <div className="space-y-2">
            <label htmlFor="evidenceType" className="text-xs text-neutral-500 uppercase tracking-[0.3em]">
              Evidence Type
            </label>
            <select
              name="evidenceType"
              id="evidenceType"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-red-500/60 focus:outline-none text-sm font-mono text-neutral-100"
              defaultValue=""
            >
              <option value="" disabled>
                Select an action
              </option>
              <option value="10">Coffee Chat • 10 pts</option>
              <option value="10">Covering a news story at GBM • 10 pts</option>
              <option value="20">Covering an ecosystem project at GBM • 20 pts</option>
              <option value="50">Attending a conference • 50 pts</option>
              <option value="75">Submitting to a hackathon • 75 pts</option>
              <option value="30">Attending a workshop/speaker event • 30 pts</option>
              <option value="5">Attending a Blockchain@USC social • 5 pts</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-[0.3em]">
              Evidence Description
            </label>
            <textarea
              name="description"
              placeholder="Share context, links, etc. If it's a coffee chat, share the name of the person you chatted with!"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-red-500/60 focus:outline-none text-sm text-neutral-100 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-[0.3em]">
              Date of Event
            </label>
            <input type="date" name="date" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-red-500/60 focus:outline-none text-sm text-neutral-100" />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-[0.3em]">
              Upload Proof
            </label>
            <div className="relative flex items-center justify-center border border-dashed border-neutral-700 rounded-xl bg-black/30 px-4 py-6 text-center">
              <input type="file" name = "proofFile" className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="space-y-1">
                <p className="text-sm text-neutral-300">Drag & drop or click to upload</p>
                <p className="text-xs text-neutral-500">PDF, image, or video up to 25MB</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold tracking-wide uppercase shadow-lg shadow-red-900/30 transition-colors"
          >
            Submit Evidence
          </button>
        </form>
          </main>
        </div>
      );
}

export default SubmitEvidence;

