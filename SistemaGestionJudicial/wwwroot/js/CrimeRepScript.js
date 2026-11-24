<script>
    document.addEventListener('DOMContentLoaded', function () {
        // 🎯 Exportar Excel
        const exportBtn = document.getElementById('exportExcelBtn');
    exportBtn?.addEventListener('click', async function () {
        exportBtn.disabled = true;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Exportando...';

    const form = document.getElementById('formexcel');
    const formData = new FormData(form);

    try {
                const response = await fetch(form.action, {
        method: 'POST',
    body: formData
                });

    if (!response.ok) throw new Error('Error al exportar.');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CrimeReports_${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "")}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

                setTimeout(() => {
        exportBtn.disabled = false;
    exportBtn.innerHTML = '<i class="fas fa-file-excel mr-2"></i>Export Excel';
                }, 1500);

            } catch (err) {
        alert("Ocurrió un error al exportar el Excel.");
    console.error(err);
    exportBtn.disabled = false;
    exportBtn.innerHTML = '<i class="fas fa-file-excel mr-2"></i>Export Excel';
            }
        });

    // 📊 Donut y Trend Chart
    const ctxDonut = document.getElementById("crimeDonutChart")?.getContext("2d");
    if (ctxDonut) {
        new Chart(ctxDonut, {
            type: 'doughnut',
            data: {
                labels: @Html.Raw(donutLabelsJson),
                datasets: [{
                    data: @Html.Raw(donutDataJson),
                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
            }
        });
        }

    const ctxTrend = document.getElementById("crimeTrendChart")?.getContext("2d");
    if (ctxTrend) {
        let chartType = 'line';
    const trendData = {
        labels: @Html.Raw(trendLabelsJson),
    datasets: [{
        label: 'Crímenes',
    data: @Html.Raw(trendDataJson),
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4
                }]
            };

    let crimeTrendChart = new Chart(ctxTrend, {
        type: chartType,
    data: trendData,
    options: {responsive: true, maintainAspectRatio: false }
            });

    document.getElementById("chartTypeSelector")?.addEventListener("change", function () {
        chartType = this.value;
    crimeTrendChart.destroy();
    crimeTrendChart = new Chart(ctxTrend, {
        type: chartType,
    data: trendData,
    options: {responsive: true, maintainAspectRatio: false }
                });
            });
        }

    // 📅 Validaciones de fechas
    const fromInput = document.querySelector('input[name="FromDate"]');
    const toInput = document.querySelector('input[name="ToDate"]');
    const today = new Date().toISOString().split('T')[0];
    const minDate = '2024-01-01';

    fromInput?.setAttribute('min', minDate);
    fromInput?.setAttribute('max', today);
    toInput?.setAttribute('max', today);

        const updateToDateLimits = () => {
            const fromValue = fromInput?.value;
    if (toInput) toInput.setAttribute('min', fromValue || minDate);
        };
    fromInput?.addEventListener('change', updateToDateLimits);
    updateToDateLimits();

    // 🧽 Limpiar filtros
    window.clearFilters = function () {
            const form = document.querySelector('#formfilter');
    if (!form) return;
    form.querySelector('input[name="FromDate"]')?.value = '';
    form.querySelector('input[name="ToDate"]')?.value = '';
    form.querySelector('input[name="CrimeType"]')?.value = '';
    form.submit();
        };

    // 🔐 Validar antes de aplicar filtros
    document.querySelector('#formfilter')?.addEventListener('submit', function (e) {
            const fromDate = this.querySelector('input[name="FromDate"]')?.value.trim();
    const toDate = this.querySelector('input[name="ToDate"]')?.value.trim();
    const crimeType = this.querySelector('input[name="CrimeType"]')?.value.trim();

    if (!fromDate && !toDate && !crimeType) {
        e.preventDefault();
    alert('Por favor, llena al menos un campo para aplicar filtros.');
            }
        });

    // 🔍 Autocompletado tipo de crimen
    const crimeInput = document.getElementById('crimeInput');
    const crimeOptions = document.getElementById('crimeOptions');
    let selectedIndex = -1;
    let filteredItems = [];

    window.filterCrimeOptions = async function () {
            const search = crimeInput?.value.trim();
    if (!search) return crimeOptions?.classList.add('hidden');

    try {
                const response = await fetch(`/CrimeReports/SearchCrimeTypes?term=${encodeURIComponent(search)}`);
    const filtered = await response.json();
    renderCrimeOptions(filtered);
            } catch (err) {
        console.error(err);
    crimeOptions?.classList.add('hidden');
            }
        };

    function renderCrimeOptions(list) {
            if (!crimeOptions) return;
    crimeOptions.innerHTML = '';
    selectedIndex = -1;
    filteredItems = list.slice(0, 10);
    if (filteredItems.length === 0) return crimeOptions.classList.add('hidden');

    const frag = document.createDocumentFragment();
            filteredItems.forEach((crime, i) => {
                const li = document.createElement('li');
    li.textContent = crime;
    li.className = 'p-2 hover:bg-blue-100 cursor-pointer';
    li.dataset.index = i;
                li.onclick = () => {
        crimeInput.value = crime;
    crimeOptions.classList.add('hidden');
                };
    frag.appendChild(li);
            });
    crimeOptions.appendChild(frag);
    crimeOptions.classList.remove('hidden');
        }

    crimeInput?.addEventListener('keydown', function (e) {
            const items = crimeOptions?.querySelectorAll('li');
    if (e.key === 'Enter' && selectedIndex === -1) e.preventDefault();

    if (e.key === 'ArrowDown' && selectedIndex < filteredItems.length - 1) {
        e.preventDefault();
    selectedIndex++;
    updateSelection(items);
            } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
        e.preventDefault();
    selectedIndex--;
    updateSelection(items);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
    crimeInput.value = filteredItems[selectedIndex];
    crimeOptions.classList.add('hidden');
    document.querySelector('#formfilter').submit();
            }
        });

    function updateSelection(items) {
        items?.forEach((item, i) => {
            item.classList.toggle('bg-blue-200', i === selectedIndex);
        });
    items[selectedIndex]?.scrollIntoView({block: 'nearest' });
        }

    document.addEventListener('click', function (e) {
            if (!crimeInput?.contains(e.target) && !crimeOptions?.contains(e.target)) {
        crimeOptions?.classList.add('hidden');
            }
        });
    });
</script>