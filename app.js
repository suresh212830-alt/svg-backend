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

// NCERT Integrals Example 13 Data[span_0](start_span)[span_0](end_span)
const ncertExample13 = {
  id: 13,
  title: "Example 13",
  description: "Evaluate the integral using partial fractions.",
  problem: { latex: "\\int \\frac{3x - 2}{(x + 1)^2 (x + 3)} \\, dx" },
  partialFraction: { latex: "\\frac{3x - 2}{(x + 1)^2 (x + 3)} = \\frac{A}{x + 1} + \\frac{B}{(x + 1)^2} + \\frac{C}{x + 3}" },
  constants: { latex: "A = \\frac{11}{4}, \\quad B = -\\frac{5}{2}, \\quad C = -\\frac{11}{4}" },
  solution: { latex: "\\int \\frac{3x - 2}{(x + 1)^2 (x + 3)} \\, dx = \\frac{11}{4} \\log |x + 1| + \\frac{5}{2(x + 1)} - \\frac{11}{4} \\log |x + 3| + C" }
};

// API Endpoint for Maxwell's Equations
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

// API Endpoint for NCERT Example 13[span_1](start_span)[span_1](end_span)
app.get('/api/ncert-example13', async (req, res) => {
  try {
    const problemSvg = await latexToSvg(ncertExample13.problem.latex);
    const pfSvg = await latexToSvg(ncertExample13.partialFraction.latex);
    const constantsSvg = await latexToSvg(ncertExample13.constants.latex);
    const solutionSvg = await latexToSvg(ncertExample13.solution.latex);

    const enrichedExample = {
      ...ncertExample13,
      problem: { ...ncertExample13.problem, svg: problemSvg },
      partialFraction: { ...ncertExample13.partialFraction, svg: pfSvg },
      constants: { ...ncertExample13.constants, svg: constantsSvg },
      solution: { ...ncertExample13.solution, svg: solutionSvg }
    };

    res.json({ success: true, example: enrichedExample });
  } catch (error) {
    console.error("Error processing MathJax for NCERT:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
