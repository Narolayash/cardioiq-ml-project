document.addEventListener("DOMContentLoaded", () => {
    // 1. Tab Navigation
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-tab");
            
            navButtons.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });

    // 2. Real-time BMI & Pulse Pressure Calculation
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    const apHiInput = document.getElementById("ap_hi");
    const apLoInput = document.getElementById("ap_lo");
    const liveBmi = document.getElementById("liveBmi");
    const livePulse = document.getElementById("livePulse");

    function updateLiveMetrics() {
        const h = parseFloat(heightInput.value) || 168;
        const w = parseFloat(weightInput.value) || 75;
        const hi = parseFloat(apHiInput.value) || 120;
        const lo = parseFloat(apLoInput.value) || 80;

        const bmiVal = (w / ((h / 100) ** 2)).toFixed(1);
        const pulseVal = Math.round(hi - lo);

        liveBmi.textContent = bmiVal;
        livePulse.textContent = `${pulseVal} mmHg`;
    }

    [heightInput, weightInput, apHiInput, apLoInput].forEach(input => {
        input.addEventListener("input", updateLiveMetrics);
    });
    updateLiveMetrics();

    // 3. Preset Profiles Menu
    const presetBtn = document.getElementById("presetBtn");
    const presetMenu = document.getElementById("presetMenu");
    let sampleProfiles = [];

    fetch("/api/sample-patients")
        .then(res => res.json())
        .then(data => {
            if (data.samples) sampleProfiles = data.samples;
        })
        .catch(err => console.log("Could not load sample profiles:", err));

    presetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        presetMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        presetMenu.classList.remove("show");
    });

    document.querySelectorAll(".preset-item").forEach(item => {
        item.addEventListener("click", () => {
            const idx = parseInt(item.getAttribute("data-sample"));
            if (sampleProfiles[idx]) {
                const p = sampleProfiles[idx];
                document.getElementById("age_years").value = p.age_years;
                document.getElementById("gender").value = p.gender;
                document.getElementById("height").value = p.height;
                document.getElementById("weight").value = p.weight;
                document.getElementById("ap_hi").value = p.ap_hi;
                document.getElementById("ap_lo").value = p.ap_lo;
                document.getElementById("cholesterol").value = p.cholesterol;
                document.getElementById("gluc").value = p.gluc;
                document.getElementById("smoke").value = p.smoke;
                document.getElementById("alco").value = p.alco;
                document.getElementById("active").value = p.active;
                updateLiveMetrics();
            }
        });
    });

    // 4. Form Submission & Simultaneous Multi-Model Prediction
    const form = document.getElementById("predictionForm");
    const submitBtn = document.getElementById("submitBtn");
    const emptyState = document.getElementById("emptyState");
    const predictionView = document.getElementById("predictionView");
    const riskBadge = document.getElementById("riskBadge");
    const probNumber = document.getElementById("probNumber");
    const probCircle = document.getElementById("probCircle");
    const diagnosisText = document.getElementById("diagnosisText");
    const adviceText = document.getElementById("adviceText");
    const factorsList = document.getElementById("factorsList");
    const resBmi = document.getElementById("resBmi");
    const resPulse = document.getElementById("resPulse");
    const resMap = document.getElementById("resMap");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Evaluating Across All 7 ML Models...`;
        lucide.createIcons();

        const payload = {
            age_years: parseFloat(document.getElementById("age_years").value),
            gender: parseInt(document.getElementById("gender").value),
            height: parseFloat(document.getElementById("height").value),
            weight: parseFloat(document.getElementById("weight").value),
            ap_hi: parseFloat(document.getElementById("ap_hi").value),
            ap_lo: parseFloat(document.getElementById("ap_lo").value),
            cholesterol: parseInt(document.getElementById("cholesterol").value),
            gluc: parseInt(document.getElementById("gluc").value),
            smoke: parseInt(document.getElementById("smoke").value),
            alco: parseInt(document.getElementById("alco").value),
            active: parseInt(document.getElementById("active").value)
        };

        try {
            const response = await fetch("/api/predict-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const primary = data.primary;

                emptyState.classList.add("hidden");
                predictionView.classList.remove("hidden");

                riskBadge.textContent = primary.risk_level;
                riskBadge.style.backgroundColor = `${primary.risk_color}22`;
                riskBadge.style.color = primary.risk_color;
                riskBadge.style.border = `1px solid ${primary.risk_color}`;

                probNumber.textContent = `${primary.disease_probability}%`;
                probNumber.style.color = primary.risk_color;
                probCircle.style.borderColor = primary.risk_color;

                diagnosisText.textContent = primary.prediction_label;
                diagnosisText.style.color = primary.risk_color;
                adviceText.textContent = primary.clinical_advice;

                factorsList.innerHTML = "";
                primary.key_factors.forEach(factor => {
                    const li = document.createElement("li");
                    li.innerHTML = `<i data-lucide="chevron-right"></i> ${factor}`;
                    factorsList.appendChild(li);
                });

                resBmi.textContent = primary.derived_metrics.bmi;
                resPulse.textContent = `${primary.derived_metrics.pulse_pressure} mmHg`;
                resMap.textContent = `${primary.derived_metrics.map_pressure} mmHg`;

                // Render Multi-Model comparison cards below
                let multiContainer = document.getElementById("multiModelContainer");
                if (!multiContainer) {
                    multiContainer = document.createElement("div");
                    multiContainer.id = "multiModelContainer";
                    multiContainer.className = "card mt-4";
                    document.getElementById("prediction-tab").appendChild(multiContainer);
                }

                multiContainer.innerHTML = `
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="check-check" color="#34d399"></i> Multi-Model Real-Time Consensus (${data.consensus.disease_votes}/${data.consensus.total_models} Models Agree)</h3>
                            <p class="card-desc">Predictions generated simultaneously across all 7 trained algorithms:</p>
                        </div>
                        <span class="record-pill">${data.consensus.agreement_percentage}% Consensus</span>
                    </div>
                    <div class="reference-grid">
                        ${data.all_models.map(m => `
                            <div class="ref-model-card" style="border-color: ${m.risk_color}55">
                                <div class="ref-card-header">
                                    <div class="ref-card-title">
                                        <i data-lucide="${m.icon || 'activity'}"></i>
                                        <span>${m.name}</span>
                                    </div>
                                    <span class="live-pred-tag" style="background-color: ${m.risk_color}22; color: ${m.risk_color}">
                                        ${m.prediction_label} (${m.disease_probability}%)
                                    </span>
                                </div>
                                <div class="ref-card-meta">
                                    <div class="ref-meta-row">
                                        <span class="meta-lbl">File:</span>
                                        <span class="meta-val font-mono">${m.file}</span>
                                    </div>
                                    <div class="ref-meta-row">
                                        <span class="meta-lbl">Week:</span>
                                        <span class="meta-val">${m.week}</span>
                                    </div>
                                </div>
                                <div class="ref-accuracy-row">
                                    <span class="acc-lbl">Test Accuracy:</span>
                                    <span class="acc-val">${m.accuracy}%</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                `;

                lucide.createIcons();
            } else {
                alert("Error: " + (data.error || "Failed to get prediction"));
            }
        } catch (err) {
            alert("Network error connecting to Flask API: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i data-lucide="stethoscope"></i> Run AI Multi-Model Assessment`;
            lucide.createIcons();
        }
    });

    // 5. Load All Models in Tab 2 (Model Metrics) matching Reference Layout
    fetch("/api/models-list")
        .then(res => res.json())
        .then(data => {
            if (data.models && data.models.length > 0) {
                const grid = document.getElementById("modelsReferenceGrid");
                if (grid) {
                    grid.innerHTML = data.models.map(m => `
                        <div class="ref-model-card ${m.is_best ? 'selected' : ''}">
                            <div class="ref-card-header">
                                <div class="ref-card-title">
                                    <i data-lucide="${m.icon || 'activity'}" class="icon-blue"></i>
                                    <span>${m.name}</span>
                                </div>
                                ${m.is_best ? '<span class="best-badge"><i data-lucide="award"></i> Best Model</span>' : ''}
                            </div>
                            <div class="ref-card-meta">
                                <div class="ref-meta-row">
                                    <span class="meta-lbl">File:</span>
                                    <span class="meta-val font-mono">${m.file}</span>
                                </div>
                                <div class="ref-meta-row">
                                    <span class="meta-lbl">Week:</span>
                                    <span class="meta-val">${m.week}</span>
                                </div>
                            </div>
                            <div class="ref-accuracy-row">
                                <span class="acc-lbl">Accuracy:</span>
                                <span class="acc-val">${m.accuracy}%</span>
                            </div>
                        </div>
                    `).join("");
                    lucide.createIcons();
                }
            }
        })
        .catch(err => console.log("Models list load error:", err));
});
