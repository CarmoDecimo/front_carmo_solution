/* app.js
  - Gestão simples de arrays cliente-side
  - Gera ficheiros .xlsx usando SheetJS (xlsx)
*/

(() => {
  // Data arrays
  const abastecimentos = [];
  const manutencoes = [];
  const horimetros = [];

  // Helpers
  const $ = id => document.getElementById(id);
  const tbody = (tableId) => document.querySelector(`#${tableId} tbody`);

  // ---------- Abastecimentos (PA.DME.01.M02) ----------
  $('ab_add_row').addEventListener('click', () => {
    const equipamento = $('ab_equipamento').value.trim();
    const activo = $('ab_activo').value.trim();
    const matricula = $('ab_matricula').value.trim();
    const qtd = $('ab_qtd').value;
    const kmh = $('ab_kmh').value;
    const assinatura = $('ab_assinatura').value.trim();

    if (!equipamento || !matricula || !qtd) {
      alert('Preenche pelo menos Equipamento, Matrícula e Quantidade.');
      return;
    }

    abastecimentos.push({
      equipamento,
      activo,
      matricula,
      qtd: parseFloat(qtd),
      kmh: kmh || '',
      assinatura
    });

    // Alimentar controlo de horímetros automaticamente
    if (kmh) {
      updateHorimetro(equipamento, activo, matricula, parseFloat(kmh), new Date().toISOString().slice(0,10));
    }

    renderAbastecimentos();
    clearAbastecimentoForm();
  });

  function renderAbastecimentos(){
    const body = tbody('table-abastecimentos');
    body.innerHTML = '';
    abastecimentos.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${r.equipamento}</td>
        <td>${r.activo}</td>
        <td>${r.matricula}</td>
        <td>${r.qtd}</td>
        <td>${r.kmh}</td>
        <td>${r.assinatura}</td>
        <td><button class="small-btn" data-idx="${idx}" data-type="del-ab">Eliminar</button></td>
      `;
      body.appendChild(tr);
    });
  }

  function clearAbastecimentoForm(){
    $('ab_equipamento').value = '';
    $('ab_activo').value = '';
    $('ab_matricula').value = '';
    $('ab_qtd').value = '';
    $('ab_kmh').value = '';
    $('ab_assinatura').value = '';
  }

  // Delegation: excluir rows
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.dataset && t.dataset.type === 'del-ab') {
      const i = parseInt(t.dataset.idx,10);
      abastecimentos.splice(i,1);
      renderAbastecimentos();
    }
    if (t.dataset && t.dataset.type === 'del-mn') {
      const i = parseInt(t.dataset.idx,10);
      manutencoes.splice(i,1);
      renderManutencoes();
    }
    if (t.dataset && t.dataset.type === 'del-hm') {
      const i = parseInt(t.dataset.idx,10);
      horimetros.splice(i,1);
      renderHorimetros();
    }
  });

  // ---------- Exportação PA.DME.01.M02 ----------
  $('ab_export').addEventListener('click', () => {
    const cabData = $('ab_cab_data').value;
    const cabExistInicio = $('ab_exist_inicio').value;
    const cabEntrada = $('ab_entrada').value;
    const cabLocal = $('ab_local').value;
    const cabMatricula = $('ab_cab_matricula').value;
    const cabOperador = $('ab_operador').value;

    const rodExistFim = $('ab_exist_fim').value;
    const rodRespFinal = $('ab_resp_final').value;

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    ws_data.push(["CONTROLO DE ABASTECIMENTO", "", "", "", "Documento Nº", "PA.DME.01.M02"]);
    ws_data.push(["", "", "", "", "Revisão:", "06"]);
    ws_data.push(["", "", "", "", "Data:", "05/08/25"]);
    ws_data.push([]);
    ws_data.push([`Data: ${cabData}`, `Existência início: ${cabExistInicio} Lts`, `Entrada Combustível: ${cabEntrada} Lts`]);
    ws_data.push([`Posto: ${cabLocal}`, `Matrícula/Ativo: ${cabMatricula}`, `Operador: ${cabOperador}`]);
    ws_data.push([]);

    ws_data.push(["Equipamento","Activo","Matrícula","Quantidade (Lts)","KM/H","Assinatura"]);
    abastecimentos.forEach(r => {
      ws_data.push([r.equipamento, r.activo, r.matricula, r.qtd, r.kmh, r.assinatura]);
    });

    ws_data.push([]);
    ws_data.push([`Existência fim do dia: ${rodExistFim} Lts`]);
    ws_data.push([`Responsável pelo abastecimento: ${rodRespFinal}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M02');
    XLSX.writeFile(wb, `PA.DME.01.M02_Controlo_Abastecimento.xlsx`);
  });

  $('ab_clear').addEventListener('click', () => {
    if (!confirm('Limpar todos os registos de abastecimento?')) return;
    abastecimentos.length = 0;
    renderAbastecimentos();
  });

  // ---------- Manutenções (PA.DME.01.M01) ----------
  $('mn_add_row').addEventListener('click', () => {
    const veiculo = $('mn_veiculo').value.trim();
    const tipo = $('mn_tipo').value.trim();
    const dataPrev = $('mn_data_prevista').value;
    const kmPrev = $('mn_km_prev').value;
    const horPrev = $('mn_horimetro_prev').value;
    const resp = $('mn_responsavel').value.trim();

    if (!veiculo || !tipo || !dataPrev) {
      alert('Preenche pelo menos Viatura, Tipo e Data Prevista.');
      return;
    }

    manutencoes.push({
      veiculo, tipo, dataPrev, kmPrev: kmPrev||'', horPrev: horPrev||'', resp, status: 'planeada'
    });

    renderManutencoes();
    clearManutencaoForm();
  });

  function renderManutencoes(){
    const body = tbody('table-manutencoes');
    body.innerHTML = '';
    manutencoes.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${r.veiculo}</td>
        <td>${r.tipo}</td>
        <td>${r.dataPrev}</td>
        <td>${r.kmPrev}</td>
        <td>${r.horPrev}</td>
        <td>${r.resp}</td>
        <td>${r.status}</td>
        <td><button class="small-btn" data-idx="${idx}" data-type="del-mn">Eliminar</button></td>
      `;
      body.appendChild(tr);
    });
  }

  function clearManutencaoForm(){
    $('mn_veiculo').value = '';
    $('mn_tipo').value = '';
    $('mn_data_prevista').value = '';
    $('mn_km_prev').value = '';
    $('mn_horimetro_prev').value = '';
    $('mn_responsavel').value = '';
  }

  $('mn_export').addEventListener('click', () => {
    if (manutencoes.length === 0) {
      if (!confirm('Tabela vazia — queres exportar um ficheiro vazio com cabeçalhos?')) return;
    }
    const header = ['Viatura','Tipo de Manutenção','Data Prevista','Quilometragem Prevista','Horímetro Previsto','Responsável','Status'];
    const rows = manutencoes.map(r => [r.veiculo, r.tipo, r.dataPrev, r.kmPrev, r.horPrev, r.resp, r.status]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws['!cols'] = [{wpx:110},{wpx:160},{wpx:100},{wpx:90},{wpx:100},{wpx:120},{wpx:90}];
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M01');
    XLSX.writeFile(wb, `PA.DME.01.M01_Calendario_Manutencao.xlsx`);
  });

  $('mn_clear').addEventListener('click', () => {
    if (!confirm('Limpar todas as manutenções?')) return;
    manutencoes.length = 0;
    renderManutencoes();
  });

  // ---------- Controlo de Horímetros (PA.DME.01.M03) ----------
  function updateHorimetro(equipamento, activo, matricula, horimetro, data) {
    let h = horimetros.find(h => h.equipamento === equipamento && h.activo === activo);
    if (h) {
      h.horAtual = horimetro;
      h.data = data;
    } else {
      horimetros.push({
        equipamento, activo, matricula,
        horAtual: horimetro, data,
        ultimaRevHor: "", ultimaRevData: "", ultimaRevTipo: "",
        proxRevHor: "", proxRevTipo: ""
      });
    }
    renderHorimetros();
  }

  function renderHorimetros() {
    const body = tbody('table-horimetros');
    if (!body) return;
    body.innerHTML = '';
    horimetros.forEach((h, idx) => {
      const faltam = (h.proxRevHor && h.horAtual) ? (h.proxRevHor - h.horAtual) : "";
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${h.equipamento}</td>
        <td>${h.activo}</td>
        <td>${h.matricula}</td>
        <td>${h.horAtual}</td>
        <td>${h.data}</td>
        <td>${faltam}</td>
        <td>${h.ultimaRevHor}</td>
        <td>${h.ultimaRevData}</td>
        <td>${h.ultimaRevTipo}</td>
        <td>${h.proxRevHor}</td>
        <td>${h.proxRevTipo}</td>
        <td><button class="small-btn" data-idx="${idx}" data-type="del-hm">Eliminar</button></td>
      `;
      body.appendChild(tr);
    });
  }

  $('hm_export').addEventListener('click', () => {
    if (horimetros.length === 0) {
      alert('Tabela de horímetros vazia.');
      return;
    }
    const header = ["Equipamento","Ativo","Matrícula","Hora/KM Atual","Data","Horas que faltam",
      "Última Rev Hor","Última Rev Data","Última Rev Tipo","Próx Rev Hor","Próx Rev Tipo"];
    const rows = horimetros.map(h => [
      h.equipamento, h.activo, h.matricula, h.horAtual, h.data,
      (h.proxRevHor && h.horAtual) ? (h.proxRevHor - h.horAtual) : "",
      h.ultimaRevHor, h.ultimaRevData, h.ultimaRevTipo,
      h.proxRevHor, h.proxRevTipo
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M03');
    XLSX.writeFile(wb, "PA.DME.01.M03_Controlo_Horimetros.xlsx");
  });

  $('hm_clear').addEventListener('click', () => {
    if (!confirm('Limpar todos os horímetros?')) return;
    horimetros.length = 0;
    renderHorimetros();
  });

  // Inicializa
  renderAbastecimentos();
  renderManutencoes();
  renderHorimetros();

})();
