import { useState } from "react";


const papers = [
  {
    era: "Foundation",
    year: 2016,
    id: 1,
    title: "Matching Networks for One Shot Learning",
    authors: "Vinyals et al.",
    venue: "NeurIPS 2016",
    color: "#a78bfa",
    coreidea: "Learn an embedding space where you compare a new example to a few known examples using similarity. The model learns to match, not classify directly.",
    analogy: "Think of it like a lineup in a crime case. You don't memorize every criminal face. You compare the suspect's face to known faces and pick the closest match.",
    input: {
      support: "A few labeled examples (e.g., 1 clinical note for Duchenne MD, 1 for Pompe Disease)",
      query: "A new unlabeled clinical note you want to classify",
    },
    output: "A probability distribution over the support set classes. E.g., { Duchenne MD: 0.85, Pompe Disease: 0.15 }",
    howItWorks: [
      "Embed both support examples and query into a shared vector space using a neural network",
      "Compute attention-weighted similarity between query and each support example",
      "The class with highest similarity score wins",
      "The network is trained across many episodes so it learns a good embedding space",
    ],
    limitation: "Attention-based similarity can be noisy. Doesn't scale well when you have more than 1-2 examples per class because it compares to individual examples, not class centers.",
    relevanceToProject: "This is the conceptual starting point. You'll understand WHY we need special architectures for few-shot instead of just fine-tuning a BERT model.",
    readFocus: "Focus on Figure 1 (the architecture diagram) and Section 2 (the loss function). Understand the episode-based training setup.",
  },
  {
    era: "Foundation",
    year: 2017,
    id: 2,
    title: "Prototypical Networks for Few-shot Learning",
    authors: "Snell et al.",
    venue: "NeurIPS 2017",
    color: "#60a5fa",
    coreidea: "Instead of comparing to each example individually, compute a single prototype (mean vector) per class and compare against that. Simpler and more stable.",
    analogy: "Instead of comparing to every known criminal face individually, you create an average composite face for each criminal type. Then compare the suspect to these composites.",
    input: {
      support: "K examples per class (e.g., 5 clinical notes each for Duchenne MD, Pompe Disease, and Fabry Disease)",
      query: "A new unlabeled clinical note",
    },
    output: "Softmax probability over classes based on distance to each class prototype. E.g., { Duchenne MD: 0.78, Pompe: 0.12, Fabry: 0.10 }",
    howItWorks: [
      "Embed all support examples using an encoder (like BioBERT in our case)",
      "For each class, compute the prototype = mean of all support embeddings for that class",
      "Embed the query using the same encoder",
      "Compute Euclidean distance from query to each prototype",
      "Apply softmax on negative distances to get probabilities",
    ],
    limitation: "Still needs a good encoder. If the pretrained encoder doesn't understand medical text well, prototypes will be meaningless. Also assumes classes are spherical clusters in embedding space.",
    relevanceToProject: "THIS IS YOUR CORE METHOD. You will implement this for rare disease detection. The prototype = average of 5 rare disease note embeddings.",
    readFocus: "Focus on Equation 1 (prototype computation), Equation 2 (classification), and Section 4.2 (experimental setup with episodes). Compare directly to Matching Networks.",
  },
  {
    era: "Transition",
    year: 2020,
    id: 3,
    title: "Exploiting Cloze Questions for Few Shot Text Classification and Natural Language Inference",
    authors: "Schick & Schütze (PET)",
    venue: "EACL 2021",
    color: "#34d399",
    coreidea: "Reframe classification as a fill-in-the-blank (cloze) task. Instead of training a classifier, ask the language model to complete a sentence. Uses pattern-verbalizer pairs.",
    analogy: "Instead of training a model to label a note as 'Duchenne MD', you give it a template: 'This patient has ___' and check if it fills in 'Duchenne' or 'Pompe'. The LM already knows language patterns.",
    input: {
      support: "Very few labeled examples (even 0-10) + a hand-crafted pattern (template) and verbalizer (word mapping)",
      query: "A clinical note to classify",
    },
    output: "Classification based on which verbalizer word the LM assigns highest probability to",
    howItWorks: [
      "Design a pattern: 'Patient note: [TEXT]. This patient has [MASK].'",
      "Define a verbalizer mapping: class Duchenne MD → word 'Duchenne', class Pompe → word 'Pompe'",
      "Feed the pattern to a masked LM (like BERT)",
      "The model predicts which word fills [MASK]",
      "The predicted word maps back to a class label",
    ],
    limitation: "Heavily depends on hand-crafted patterns and verbalizers. Bad pattern = bad results. Also, rare disease names might not be in the LM's vocabulary well.",
    relevanceToProject: "Shows a completely different paradigm: using LM's own knowledge instead of learning embeddings. You'll understand why prompt-based methods emerged as an alternative to metric-based ones.",
    readFocus: "Read Section 2 (the PET framework) and Section 3.1 (pattern-verbalizer pairs). Compare the philosophy to Prototypical Networks: embedding space vs language understanding.",
  },
  {
    era: "Transition",
    year: 2021,
    id: 4,
    title: "Making Pre-trained Language Models Better Few-shot Learners (LM-BFF)",
    authors: "Gao et al.",
    venue: "ACL 2021",
    color: "#fb923c",
    coreidea: "Automatically generate better prompts instead of hand-crafting them. Combines automatic prompt generation with demonstration selection to get strong few-shot performance from PLMs.",
    analogy: "Instead of YOU writing the fill-in-the-blank template, the model searches for the best template automatically. It also picks which examples to show alongside the query for best results.",
    input: {
      support: "K labeled examples (5-10) + the model automatically finds good prompt templates",
      query: "A text to classify",
    },
    output: "Class prediction via optimized prompts. Much better accuracy than manual prompts.",
    howItWorks: [
      "Start with a few labeled examples",
      "Automatically generate candidate prompt templates using a T5 model",
      "Score each template on a small validation set",
      "Pick the best template",
      "Also select the best demonstration examples to include in the prompt",
      "Use this optimized prompt for classification",
    ],
    limitation: "Still prompt-based, so depends on LM quality. Automatic prompt search is slow. Doesn't fundamentally change the paradigm, just automates the engineering.",
    relevanceToProject: "Shows how the field moved from hand-crafted prompts to automatic ones. For your project, this means you don't need to manually design medical prompts — the method can find them.",
    readFocus: "Read Section 3 (automatic prompt generation) and Table 1 (comparison with manual prompts). Understand WHY automatic prompts beat manual ones.",
  },
  {
    era: "Modern",
    year: 2022,
    id: 5,
    title: "SetFit: Efficient and Powerful Few-Shot Learning Without Prompts",
    authors: "Tunstall et al.",
    venue: "NeurIPS 2022",
    color: "#f472b6",
    coreidea: "Combine contrastive learning on sentence transformers with a simple classifier head. No prompts needed. Works incredibly well with 8-64 labeled examples. Fast and CPU-friendly.",
    analogy: "First, train the model so that similar clinical notes (same disease) are close together in space, and different diseases are far apart — using contrastive pairs. Then slap a simple classifier on top. The hard work is in learning the right distances.",
    input: {
      support: "8-64 labeled examples per class (very few!)",
      query: "New text to classify",
    },
    output: "Class prediction with high confidence. Competitive with GPT-3 few-shot but runs on CPU.",
    howItWorks: [
      "Generate training pairs: (note_A, note_B, same_disease=1) or (note_A, note_C, same_disease=0)",
      "Fine-tune a sentence transformer using contrastive loss so same-class pairs are close, different-class pairs are far",
      "Train a lightweight classification head (logistic regression) on the fine-tuned embeddings",
      "At inference: embed query → classify with the head",
    ],
    limitation: "Needs at least 8 examples per class (not truly 1-shot). Sentence transformer quality matters a lot. Less interpretable than attention-based methods.",
    relevanceToProject: "THIS IS YOUR RECOMMENDED METHOD. It's CPU-friendly, works with 5-10 examples per rare disease, and is state-of-the-art for few-shot text classification. You will implement this.",
    readFocus: "Read Section 2 (method overview), Section 3 (contrastive learning details), and Figure 2 (comparison with other methods across different shot counts). This is the paper you need to understand deepest.",
  },
  {
    era: "Modern",
    year: 2022,
    id: 6,
    title: "MetaICL: Learning to Learn In Context",
    authors: "Min et al.",
    venue: "NAACL 2022",
    color: "#38bdf8",
    coreidea: "Meta-train a language model so it becomes good at in-context learning (learning from examples shown in the prompt) without any gradient updates at test time.",
    analogy: "Instead of teaching the model one disease at a time, you train it on thousands of different tasks so it learns HOW to learn from examples. At test time, just show it 5 examples and it figures it out — no training needed.",
    input: {
      support: "A few examples shown directly in the prompt (in-context)",
      query: "The target text appended to the prompt",
    },
    output: "Prediction generated by the LM based purely on the in-context examples. Zero gradient updates at test time.",
    howItWorks: [
      "Meta-train on thousands of diverse tasks (each as an in-context learning episode)",
      "The model learns a general 'learning from examples' ability",
      "At test time: format support examples + query as a prompt",
      "The model predicts the label with no fine-tuning",
    ],
    limitation: "Requires a large base LM. Meta-training is expensive. May not work as well on highly specialized domains like rare diseases without domain-specific meta-training.",
    relevanceToProject: "Shows the latest paradigm: making LMs themselves few-shot learners. For your project, this is an alternative approach if you want to use a larger LM like Llama.",
    readFocus: "Read Section 2 (MetaICL formulation) and Table 1 (comparison with GPT-3 in-context learning). Understand the difference between meta-learning and in-context learning.",
  },
  {
    era: "Medical Domain",
    year: 2021,
    id: 7,
    title: "UMLSBERT: Clinical Domain Knowledge Augmentation",
    authors: "Michalopoulos et al.",
    venue: "NAACL 2021",
    color: "#a3e635",
    coreidea: "Pre-train BERT using UMLS (medical knowledge base) to create embeddings that understand medical concepts better than generic BERT. Injects medical knowledge into the representation.",
    analogy: "Instead of learning language from general books, this model studied medical textbooks AND memorized a medical dictionary (UMLS). So when it sees 'elevated CK levels', it already knows CK = creatine kinase = muscle damage marker.",
    input: {
      support: "Clinical text (notes, reports)",
      query: "Any medical text you want to embed or classify",
    },
    output: "Embeddings that are medically-informed. Better representations for downstream tasks like rare disease detection.",
    howItWorks: [
      "Take standard BERT architecture",
      "During pre-training, add a task: predict UMLS concept IDs for medical terms in the text",
      "This forces the model to learn medical concept relationships",
      "The resulting embeddings capture medical knowledge beyond just language patterns",
    ],
    limitation: "Still a BERT-sized model. Doesn't solve the few-shot problem directly — it just gives you better starting embeddings.",
    relevanceToProject: "YOUR ENCODER. When you implement Prototypical Networks or SetFit, you'll use a medically-informed encoder like this as your backbone. Better embeddings = better prototypes = better rare disease detection.",
    readFocus: "Read Section 3 (UMLS integration method) and Table 2 (comparison with vanilla BioBERT). Understand HOW medical knowledge is injected into embeddings.",
  },
  {
    era: "Medical Domain",
    year: 2023,
    id: 8,
    title: "Contrastive Learning for Medical Entity Extraction with Limited Annotations",
    authors: "Gu et al.",
    venue: "EMNLP 2023",
    color: "#fb7185",
    coreidea: "Apply contrastive learning specifically to medical NER with very few annotations. Creates medical-domain-aware representations by contrasting entity mentions.",
    analogy: "Train the model so that all mentions of 'muscular dystrophy' (even phrased differently) cluster together, and are far from 'Pompe disease' mentions. Uses contrastive pairs built from medical text.",
    input: {
      support: "5-10 annotated medical entity examples",
      query: "Clinical text with entities to extract",
    },
    output: "Extracted medical entities with high accuracy despite limited training data.",
    howItWorks: [
      "Create positive pairs: different mentions of the same medical entity",
      "Create negative pairs: mentions of different entities",
      "Train encoder with contrastive loss",
      "Fine-tune entity extraction head on the improved representations",
    ],
    limitation: "Focused on NER, not full document classification. Needs some entity-level annotations.",
    relevanceToProject: "Directly applicable technique. Your rare disease detection is essentially medical entity detection at the document level. The contrastive learning idea from this paper feeds directly into SetFit.",
    readFocus: "Read Section 3 (contrastive learning setup for medical entities) and Section 4.2 (few-shot results). See how contrastive learning specifically helps in the medical domain.",
  },
  {
    era: "Medical Domain",
    year: 2022,
    id: 9,
    title: "Zero-shot and Few-shot Learning for Rare Disease Phenotyping",
    authors: "Groza et al.",
    venue: "J Biomed Semantics 2022",
    color: "#c084fc",
    coreidea: "THE closest paper to your project. Tests zero-shot and few-shot methods specifically on rare disease phenotyping using HPO (Human Phenotype Ontology).",
    analogy: "Someone already tried something similar to what you want to do, but used a different approach (HPO-based). Your job is to do it BETTER using modern few-shot methods like SetFit and Prototypical Networks.",
    input: {
      support: "HPO phenotype descriptions + few clinical examples",
      query: "Patient phenotype descriptions to classify",
    },
    output: "Rare disease predictions from phenotype descriptions.",
    howItWorks: [
      "Use HPO to represent rare disease phenotypes as structured descriptions",
      "Apply zero-shot matching between patient phenotypes and disease phenotypes",
      "Test few-shot learning with limited patient examples",
      "Evaluate on a benchmark of rare genetic disorders",
    ],
    limitation: "Relies heavily on HPO structured data. Doesn't work well on free-text clinical notes. Limited to genetic disorders with good HPO annotations.",
    relevanceToProject: "THIS IS YOUR BASELINE AND MOTIVATION. Your paper says: 'Groza et al. showed few-shot works for structured phenotypes. We extend this to unstructured clinical notes using modern methods.' This is your novelty gap.",
    readFocus: "Read the ENTIRE paper. This is your closest prior work. Understand exactly what they did and didn't do. Your contribution = what they missed.",
  },
];

const EraTag = ({ era }) => {
  const colors = {
    Foundation: { bg: "#1e1b4b", text: "#a78bfa" },
    Transition: { bg: "#1a2e1a", text: "#34d399" },
    Modern: { bg: "#1f1a2e", text: "#f472b6" },
    "Medical Domain": { bg: "#1a1f2e", text: "#60a5fa" },
  };
  const c = colors[era] || { bg: "#222", text: "#aaa" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        border: `1px solid ${c.text}33`,
      }}
    >
      {era}
    </span>
  );
};

const TimelineDot = ({ color, active }) => (
  <div
    style={{
      width: active ? 18 : 14,
      height: active ? 18 : 14,
      borderRadius: "50%",
      background: color,
      boxShadow: active ? `0 0 12px ${color}66` : "none",
      transition: "all 0.3s ease",
      border: "2px solid #1e1e2e",
      flexShrink: 0,
    }}
  />
);

export default function App() {
  const [selected, setSelected] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const paper = papers[selected];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "io", label: "Input / Output" },
    { id: "how", label: "How It Works" },
    { id: "relevance", label: "Your Project" },
  ];

  return (
    <div
      style={{
        background: "#0f0f14",
        color: "#e2e2e8",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px",
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: "#666",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Reading Guide
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Few-Shot Learning for Rare Disease Detection
        </h1>
        <p style={{ color: "#555", fontSize: 13, margin: "8px 0 0" }}>
          Read papers in order. Each builds on the previous. Understand the
          evolution before you code.
        </p>
      </div>

      {/* Timeline */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            background: "#2a2a35",
            zIndex: 0,
          }}
        />
        {papers.map((p, i) => (
          <div
            key={p.id}
            onClick={() => {
              setSelected(i);
              setActiveTab("overview");
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: i === selected ? p.color : "#555",
                fontWeight: 600,
                transition: "color 0.3s",
              }}
            >
              {p.year}
            </span>
            <TimelineDot color={p.color} active={i === selected} />
            <span
              style={{
                fontSize: 9,
                color: i === selected ? "#aaa" : "#444",
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 60,
                transition: "color 0.3s",
              }}
            >
              {p.authors.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          background: "#1a1a24",
          borderRadius: 16,
          border: "1px solid #2a2a38",
          overflow: "hidden",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #2a2a38",
            background: `linear-gradient(135deg, ${paper.color}08 0%, transparent 60%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                background: paper.color + "18",
                color: paper.color,
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {paper.id}
            </div>
            <div>
              <EraTag era={paper.era} />
              <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }}>
                {paper.venue}
              </span>
            </div>
          </div>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#fff",
              margin: "0 0 4px",
              lineHeight: 1.3,
            }}
          >
            {paper.title}
          </h2>
          <span style={{ color: "#666", fontSize: 12 }}>{paper.authors}</span>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #2a2a38",
            background: "#151518",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 0",
                background: "none",
                border: "none",
                color: activeTab === tab.id ? paper.color : "#555",
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                borderBottom:
                  activeTab === tab.id ? `2px solid ${paper.color}` : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "20px 24px" }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: paper.color,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Core Idea
                </div>
                <p style={{ color: "#ccc", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {paper.coreidea}
                </p>
              </div>
              <div
                style={{
                  background: "#12121a",
                  borderRadius: 10,
                  padding: "14px 18px",
                  border: `1px solid ${paper.color}22`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: paper.color,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  💡 Analogy
                </div>
                <p style={{ color: "#aaa", fontSize: 13, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                  {paper.analogy}
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  ⚠️ Limitation
                </div>
                <p style={{ color: "#777", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  {paper.limitation}
                </p>
              </div>
              <div
                style={{
                  background: "#1a1a12",
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: "1px solid #3a3a1a",
                  marginTop: 4,
                }}
              >
                <div style={{ fontSize: 10, color: "#8a8a3a", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  📖 What to Focus On When Reading
                </div>
                <p style={{ color: "#9a9a6a", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  {paper.readFocus}
                </p>
              </div>
            </div>
          )}

          {activeTab === "io" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "#12121a",
                  borderRadius: 10,
                  padding: "16px 18px",
                  border: "1px solid #2a3a2a",
                }}
              >
                <div style={{ fontSize: 11, color: "#34d399", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                  📥 Input
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>
                      Support Set
                    </span>
                    <p style={{ color: "#aaa", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
                      {paper.input.support}
                    </p>
                  </div>
                  <div style={{ borderTop: "1px solid #2a2a38", paddingTop: 10 }}>
                    <span style={{ color: "#60a5fa", fontSize: 12, fontWeight: 600 }}>
                      Query
                    </span>
                    <p style={{ color: "#aaa", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
                      {paper.input.query}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#1a121a",
                  borderRadius: 10,
                  padding: "16px 18px",
                  border: "1px solid #3a2a3a",
                }}
              >
                <div style={{ fontSize: 11, color: "#f472b6", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  📤 Output
                </div>
                <p style={{ color: "#ccc", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  {paper.output}
                </p>
              </div>
            </div>
          )}

          {activeTab === "how" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {paper.howItWorks.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: paper.color + "18",
                      color: paper.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ color: "#bbb", fontSize: 13, margin: 0, lineHeight: 1.6, paddingTop: 2 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "relevance" && (
            <div
              style={{
                background: `linear-gradient(135deg, ${paper.color}0a 0%, #1a1a24 100%)`,
                borderRadius: 10,
                padding: "18px 20px",
                border: `1px solid ${paper.color}33`,
              }}
            >
              <div style={{ fontSize: 11, color: paper.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                🎯 How This Connects to Your Rare Disease Project
              </div>
              <p style={{ color: "#ccc", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                {paper.relevanceToProject}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Evolution Summary */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          background: "#1a1a24",
          borderRadius: 16,
          border: "1px solid #2a2a38",
          padding: "20px 24px",
        }}
      >
        <div style={{ fontSize: 11, color: "#666", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
          📈 The Evolution in One View
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "2016-2017", desc: "Metric-based: Learn embedding spaces. Compare by distance.", color: "#a78bfa" },
            { label: "2020-2021", desc: "Prompt-based: Reframe as fill-in-the-blank. Use LM knowledge.", color: "#34d399" },
            { label: "2022", desc: "Hybrid: Contrastive learning + simple classifiers (SetFit). Best of both worlds.", color: "#f472b6" },
            { label: "2022+", desc: "Meta-learning: Teach models HOW to learn from examples.", color: "#38bdf8" },
            { label: "Medical", desc: "Domain adaptation: Inject medical knowledge into all of the above.", color: "#60a5fa" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  color: item.color,
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 70,
                  paddingTop: 1,
                }}
              >
                {item.label}
              </span>
              <div style={{ flex: 1, height: 1, background: "#2a2a38", marginTop: 8 }} />
              <span style={{ color: "#aaa", fontSize: 12, flex: 2, lineHeight: 1.5 }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => { setSelected(Math.max(0, selected - 1)); setActiveTab("overview"); }}
          disabled={selected === 0}
          style={{
            background: selected === 0 ? "#1a1a24" : "#2a2a38",
            color: selected === 0 ? "#444" : "#ccc",
            border: "1px solid #2a2a38",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: selected === 0 ? "default" : "pointer",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          ← Previous Paper
        </button>
        <span style={{ color: "#555", fontSize: 12, alignSelf: "center" }}>
          {selected + 1} / {papers.length}
        </span>
        <button
          onClick={() => { setSelected(Math.min(papers.length - 1, selected + 1)); setActiveTab("overview"); }}
          disabled={selected === papers.length - 1}
          style={{
            background: selected === papers.length - 1 ? "#1a1a24" : papers[selected].color + "22",
            color: selected === papers.length - 1 ? "#444" : papers[selected].color,
            border: `1px solid ${selected === papers.length - 1 ? "#2a2a38" : papers[selected].color + "44"}`,
            borderRadius: 8,
            padding: "8px 18px",
            cursor: selected === papers.length - 1 ? "default" : "pointer",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Next Paper →
        </button>
      </div>
    </div>
  );
}