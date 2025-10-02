import { useState } from 'react';

export default function Home(){
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(){
    setLoading(true); setError(null);
    try{
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobText })
      });
      if(!r.ok){ throw new Error('Erreur serveur'); }
      const data = await r.json();
      setOut(data);
    }catch(e:any){
      setError(e.message || 'Erreur');
    }finally{ setLoading(false); }
  }

  return (
    <main>
      <div className="h">
        <h1>CV-IA — Générateur de candidatures</h1>
        <span className="badge">MVP fonctionnel</span>
      </div>
      <p>Collez votre CV et l’offre d’emploi. Cliquez sur Générer.</p>

      <div className="grid">
        <div className="card">
          <label>Votre CV (texte brut)</label>
          <textarea rows={14} value={cvText} onChange={e=>setCvText(e.target.value)} />
        </div>
        <div className="card">
          <label>Offre d'emploi (texte)</label>
          <textarea rows={14} value={jobText} onChange={e=>setJobText(e.target.value)} />
        </div>
      </div>

      <div style={{marginTop:16}}>
        <button onClick={handleGenerate} disabled={loading || !cvText || !jobText}>
          {loading ? 'Génération en cours...' : 'Générer CV + Lettre + Checklist'}
        </button>
      </div>

      {error && <p style={{color:'red'}}>{error}</p>}

      {out && (
        <section style={{marginTop:24}}>
          <h2>CV optimisé</h2>
          <pre>{out.cvOptimise}</pre>
          <h2>Lettre</h2>
          <pre>{out.lettre}</pre>
          <h2>Checklist</h2>
          <pre>{out.checklist}</pre>
          <h2>Score ATS</h2>
          <pre>{out.score}</pre>
        </section>
      )}
    </main>
  );
}
