
const express = require('express');
const cors = require('cors');
const mjAPI = require('mathjax-node');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize MathJax
mjAPI.config({
  MathJax: {
    // Configuration options if needed
  }
});
mjAPI.start();

// Helper function to convert LaTeX to SVG
const latexToSvg = (latexString) => {
  return new Promise((resolve) => {
    mjAPI.typeset({
      math: latexString,
      format: "TeX",
      svg: true,
    }, (data) => {
      if (data.errors) {
        resolve(null);
      } else {
        resolve(data.svg);
      }
    });
  });
};

// Maxwell's Equations Data
const equationsData = [
  {
    id: 1,
    name: "Gauss's Law for Electricity",
    description: "Relates electric field to electric charge distribution.",
    differential: { latex: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}" },
    integral: { latex: "\\oint_S \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}" }
  },
  {
    id: 2,
    name: "Gauss's Law for Magnetism",
    description: "States that magnetic monopoles do not exist.",
    differential: { latex: "\\nabla \\cdot \\mathbf{B} = 0" },
    integral: { latex: "\\oint_S \\mathbf{B} \\cdot d\\mathbf{A} = 0" }
  },
  {
    id: 3,
    name: "Faraday's Law of Induction",
    description: "Relates changing magnetic field to an induced electric field.",
    differential: { latex: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}" },
    integral: { latex: "\\oint_C \\mathbf{E} \\cdot d\\mathbf{l} = -\\frac{d}{dt} \\int_S \\mathbf{B} \\cdot d\\mathbf{A}" }
  },
  {
    id: 4,
    name: "Ampere-Maxwell Law",
    description: "Relates magnetic fields to electric currents and changing electric fields.",
    differential: { latex: "\\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}" },
    integral: { latex: "\\oint_C \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 I_{\\text{enc}} + \\mu_0\\varepsilon_0 \\frac{d}{dt} \\int_S \\mathbf{E} \\cdot d\\mathbf{A}" }
  }
];

// API Endpoint
app.get('/api/maxwell-equations', async (req, res) => {
  try {
    const enrichedEquations = [];
    
    for (const eq of equationsData) {
      const diffSvg = await latexToSvg(eq.differential.latex);
      const intSvg = await latexToSvg(eq.integral.latex);

      enrichedEquations.push({
        ...eq,
        differential: { ...eq.differential, svg: diffSvg },
        integral: { ...eq.integral, svg: intSvg }
      });
    }

    res.json({ success: true, equations: enrichedEquations });
  } catch (error) {
    console.error("Error processing MathJax:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
