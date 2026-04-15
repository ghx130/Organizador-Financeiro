// dashboard.js - demo charts e sessão simples
(function(){
  // Checar sessão (simples localStorage)
  const user = localStorage.getItem('username');
  const logged = localStorage.getItem('loggedIn');
  if(!logged || !user){
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('userName').textContent = user;

  const familyPrefix = 'familyShared';
  const goalKey = `${familyPrefix}_goal`;
  const furnitureKey = `${familyPrefix}_furnitureItems`;
  const budgetKey = `${familyPrefix}_budgets`;
  const expenseKey = `${familyPrefix}_expenses`;
  const acquisitionsKey = `${familyPrefix}_acquisitions`;
  const constructionKey = `${familyPrefix}_construction`;
  const piggyKey = `${familyPrefix}_piggy`;

  // Carregar meta e valores do localStorage
  let goal = JSON.parse(localStorage.getItem(goalKey)) || {
    name: 'Entrada da casa',
    target: 100000,
    saved: 21500
  };

  let piggy = loadPiggy();

  function saveGoal(){
    localStorage.setItem(goalKey, JSON.stringify(goal));
  }

  function loadPiggy(){
    try{
      const raw = localStorage.getItem(piggyKey);
      if(raw) return JSON.parse(raw);
    } catch(e){ console.warn('Erro ao carregar cofrinho', e); }
    const initial = { amount: 0, note: 'Cofrinho familiar' };
    localStorage.setItem(piggyKey, JSON.stringify(initial));
    return initial;
  }

  function savePiggy(){
    localStorage.setItem(piggyKey, JSON.stringify(piggy));
    updatePiggyDisplay();
  }

  function updatePiggyDisplay(){
    const piggyAmountEl = document.getElementById('piggyAmount');
    if(piggyAmountEl){
      piggyAmountEl.textContent = formatBRL(piggy.amount);
      piggyAmountEl.title = piggy.note || 'Cofrinho familiar';
    }
  }

  function editPiggy(){
    const input = prompt('Valor atual do cofrinho (R$):', piggy.amount.toFixed(2));
    if(input === null) return;
    const newValue = parseFloat(input.replace(',', '.'));
    if(isNaN(newValue) || newValue < 0){
      showToast('Valor inválido para o cofrinho');
      return;
    }
    piggy.amount = Math.round(newValue * 100) / 100;
    savePiggy();
    showToast('Cofrinho atualizado');
  }

  function updateGoalDisplay(){
    document.getElementById('currentBalance').textContent = formatBRL(goal.saved);
    document.getElementById('lastMonth').textContent = formatBRL(goal.saved);
    document.getElementById('goalName').textContent = goal.name;
    document.getElementById('goalShort').textContent = `${formatBRL(goal.saved)} de ${formatBRL(goal.target)}`;
    const pct = Math.min(100, Math.round((goal.saved/goal.target)*100));
    document.getElementById('goalBar').style.width = pct + '%';
    
    const goalsList = document.getElementById('goalsList');
    goalsList.innerHTML = '';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${goal.name}</strong> — ${formatBRL(goal.saved)} / ${formatBRL(goal.target)} (${pct}%)`;
    goalsList.appendChild(li);
  }

  function loadPhotoGallery(){
    try{
      const raw = localStorage.getItem(`${familyPrefix}_silverstonePhotos`);
      if(raw) return JSON.parse(raw);
    } catch(e){ console.warn('Erro ao carregar galeria Silverstone', e); }
    const initial = [];
    localStorage.setItem(`${familyPrefix}_silverstonePhotos`, JSON.stringify(initial));
    return initial;
  }

  function savePhotoGallery(){
    localStorage.setItem(`${familyPrefix}_silverstonePhotos`, JSON.stringify(photoGallery));
    renderPhotoGallery();
  }

  function renderPhotoGallery(){
    const gallery = document.getElementById('photoGallery');
    if(!gallery) return;
    gallery.innerHTML = '';
    if(photoGallery.length === 0){
      const msg = document.createElement('p');
      msg.style.cssText = 'padding:16px;color:#07344f;text-align:center';
      msg.textContent = 'Nenhuma foto adicionada ainda para o Silverstone.';
      gallery.appendChild(msg);
      return;
    }
    photoGallery.forEach((photo, index)=>{
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <img src="${photo.src}" alt="Foto Silverstone ${index+1}" />
        <div class="photo-actions">
          <button type="button" data-index="${index}" class="remove-photo">Excluir</button>
        </div>
        ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
      `;
      gallery.appendChild(card);
    });
    Array.from(gallery.querySelectorAll('.remove-photo')).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.getAttribute('data-index'));
        photoGallery.splice(idx, 1);
        savePhotoGallery();
      });
    });
  }

  function addPhotoUrl(){
    const input = document.getElementById('photoUrlInput');
    if(!input) return;
    const url = input.value.trim();
    if(!url){ showToast('Cole a URL da foto para adicionar.'); return; }
    photoGallery.unshift({ src: url, caption: 'Silverstone' });
    input.value = '';
    savePhotoGallery();
    showToast('Foto adicionada ao Silverstone!');
  }

  function handlePhotoFile(event){
    const file = event.target.files && event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(){
      photoGallery.unshift({ src: reader.result, caption: 'Silverstone' });
      savePhotoGallery();
      showToast('Foto enviada ao Silverstone!');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  const photoGallery = loadPhotoGallery();
  const addPhotoUrlBtn = document.getElementById('addPhotoUrlBtn');
  const photoFileInput = document.getElementById('photoFileInput');
  if(addPhotoUrlBtn) addPhotoUrlBtn.addEventListener('click', addPhotoUrl);
  if(photoFileInput) photoFileInput.addEventListener('change', handlePhotoFile);
  renderPhotoGallery();

  // Tornar elementos clicáveis
  const currentBalanceEl = document.getElementById('currentBalance');
  const goalShortEl = document.getElementById('goalShort');
  
  currentBalanceEl.style.cursor = 'pointer';
  currentBalanceEl.title = 'Clique para editar saldo';
  currentBalanceEl.addEventListener('click', ()=>{
    const input = prompt('Novo saldo atual (R$):', (goal.saved / 100).toFixed(2));
    if(input !== null){
      const newVal = parseFloat(input.replace(',', '.'));
      if(!isNaN(newVal) && newVal >= 0){
        goal.saved = Math.round(newVal * 100) / 100;
        saveGoal();
        updateGoalDisplay();
        showToast(`Saldo atualizado: ${formatBRL(goal.saved)}`);
      }
    }
  });

  goalShortEl.style.cursor = 'pointer';
  goalShortEl.title = 'Clique para editar meta';
  goalShortEl.addEventListener('click', ()=>{
    const input = prompt('Nova meta (R$):', (goal.target / 100).toFixed(2));
    if(input !== null){
      const newVal = parseFloat(input.replace(',', '.'));
      if(!isNaN(newVal) && newVal > 0){
        goal.target = Math.round(newVal * 100) / 100;
        saveGoal();
        updateGoalDisplay();
        showToast(`Meta atualizada: ${formatBRL(goal.target)}`);
      }
    }
  });

  const goalNameEl = document.getElementById('goalName');
  if(goalNameEl){
    goalNameEl.style.cursor = 'pointer';
    goalNameEl.title = 'Clique para editar o nome da meta';
    goalNameEl.addEventListener('click', ()=>{
      const input = prompt('Nome da meta:', goal.name);
      if(input !== null){
        const newName = input.trim();
        if(newName.length > 0){
          goal.name = newName;
          saveGoal();
          updateGoalDisplay();
          showToast('Nome da meta atualizado');
        }
      }
    });
  }

  updateGoalDisplay();
  updatePiggyDisplay();
  const editPiggyBtn = document.getElementById('editPiggyBtn');
  if(editPiggyBtn){ editPiggyBtn.addEventListener('click', editPiggy); }

  // ======================
  // Painel lateral: móveis
  // ======================
  const defaultItems = [
    {id: genId(), name:'Sofá', bought:false, price:null, priority:null, category:'mobilia'},
    {id: genId(), name:'Geladeira', bought:false, price:2500, priority:2, category:'cozinha'},
    {id: genId(), name:'Fogão', bought:false, price:1200, priority:2, category:'cozinha'},
    {id: genId(), name:'Cama casal', bought:true, price:800, priority:3, category:'quarto'}
  ];

  const presetsByCategory = {
    cozinha: [
      { name: 'Geladeira', price: 2500 },
      { name: 'Fogão', price: 1200 },
      { name: 'Micro-ondas', price: 400 },
      { name: 'Máquina de lavar', price: 1500 }
    ],
    banheiro: [
      { name: 'Box banheiro', price: 300 },
      { name: 'Armário banheiro', price: 250 },
      { name: 'Espelho', price: 120 }
    ],
    mobilia: [
      { name: 'Sofá', price: 1200 },
      { name: 'Mesa de jantar', price: 700 },
      { name: 'Rack TV', price: 350 }
    ],
    quarto: [
      { name: 'Cama casal', price: 800 },
      { name: 'Guarda-roupa', price: 800 },
      { name: 'Criado-mudo', price: 150 }
    ],
    outros: [
      { name: 'Tapete', price: 200 },
      { name: 'Luminária', price: 120 }
    ]
  };

  let furniture = loadFurniture();

  const moreBtn = document.getElementById('moreBtn');
  const sidePanel = document.getElementById('sidePanel');
  const closePanel = document.getElementById('closePanel');
  const panelBackdrop = document.getElementById('panelBackdrop');
  const furnitureList = document.getElementById('furnitureList');
  const newItemInput = document.getElementById('newItemInput');
  const newItemCategory = document.getElementById('newItemCategory');
  const addItemBtn = document.getElementById('addItemBtn');
  const filterButtons = Array.from(document.querySelectorAll('.filter'));
  let currentFilter = 'all';

  moreBtn.addEventListener('click', ()=> {
    if(sidePanel.classList.contains('open') && sidePanel.classList.contains('full')){
      closePanelFn();
    } else {
      openPanel(true);
    }
  });
  closePanel.addEventListener('click', ()=> closePanelFn());
  addItemBtn.addEventListener('click', ()=>{
    const v = newItemInput.value.trim(); if(!v) return; const cat = newItemCategory.value || 'outros'; addItem(v, cat); newItemInput.value='';
  });
  newItemInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); addItemBtn.click(); } });

  const addDefaultsBtn = document.getElementById('addDefaultsBtn');
  if(addDefaultsBtn){
    addDefaultsBtn.addEventListener('click', ()=>{
      const cat = newItemCategory.value || 'outros';
      const added = addPresetsForCategory(cat);
      if(added > 0) showToast(`Adicionados ${added} itens em ${cat}`);
      else showToast('Nenhum item novo para adicionar nesta categoria');
    });
  }

  function openPanel(full){
    sidePanel.setAttribute('aria-hidden','false');
    if(full){
      sidePanel.classList.add('full');
      sidePanel.offsetHeight;
      sidePanel.classList.add('open');
      panelBackdrop.classList.add('visible');
      panelBackdrop.setAttribute('aria-hidden','false');
    } else {
      sidePanel.classList.remove('full');
      sidePanel.classList.add('open');
      panelBackdrop.classList.remove('visible');
      panelBackdrop.setAttribute('aria-hidden','true');
    }
  }
  function closePanelFn(){ sidePanel.setAttribute('aria-hidden','true'); sidePanel.classList.remove('open'); sidePanel.classList.remove('full'); panelBackdrop.classList.remove('visible'); panelBackdrop.setAttribute('aria-hidden','true'); }

  panelBackdrop.addEventListener('click', ()=> closePanelFn());
  document.addEventListener('click', function(e){
    const insidePanel = !!e.target.closest('#sidePanel');
    const clickedMore = !!e.target.closest('#moreBtn');
    if(sidePanel.classList.contains('open') && !insidePanel && !clickedMore && !sidePanel.classList.contains('full')){
      closePanelFn();
    }
  });

  filterButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderFurniture();
    });
  });

  function loadFurniture(){
    try{
      const raw = localStorage.getItem(furnitureKey);
      if(!raw) { localStorage.setItem(furnitureKey, JSON.stringify(defaultItems)); return defaultItems.slice(); }
      return JSON.parse(raw);
    }catch(e){ console.warn('Erro ao ler móveis', e); return defaultItems.slice(); }
  }

  function saveFurniture(){ localStorage.setItem(furnitureKey, JSON.stringify(furniture)); }

  function renderFurniture(){
    furnitureList.innerHTML = '';
    let items = furniture.slice();
    if(currentFilter === 'todo') items = items.filter(i=>!i.bought);
    if(currentFilter === 'bought') items = items.filter(i=>i.bought);

    if(!items.length){
      const el = document.createElement('li'); el.textContent='Nenhum item ainda.'; el.style.padding='10px'; furnitureList.appendChild(el); return;
    }
    const categoryOrder = ['cozinha','banheiro','mobilia','quarto','outros'];
    const categoryNames = {cozinha:'Cozinha', banheiro:'Banheiro', mobilia:'Mobiliário', quarto:'Quarto', outros:'Outros'};
    const grouped = {};
    items.forEach(i=>{ const cat = i.category || 'outros'; (grouped[cat] = grouped[cat] || []).push(i); });

    let any = false;
    categoryOrder.forEach(cat => {
      const list = grouped[cat] || [];
      if(!list.length) return;
      any = true;
      const header = document.createElement('li');
      header.className = 'category-header';
      header.innerHTML = `<strong>${categoryNames[cat]}</strong> <span class="count">(${list.length})</span>`;
      furnitureList.appendChild(header);
      list.forEach(it=>{
        const li = document.createElement('li');
        if(it.bought) li.classList.add('bought');
        const icon = emojiForName(it.name);
        li.innerHTML = `
          <div class="icon">${icon}</div>
          <div class="info">
            <input type="checkbox" class="chk" data-id="${it.id}" ${it.bought? 'checked':''} />
            <div class="meta-group">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="name">${escapeHtml(it.name)}</div>
                <div class="price" data-id="${it.id}">${it.price != null ? formatBRL(it.price) : '—'}</div>
              </div>
              <div class="meta">#${it.id} · ${it.bought? 'Comprado' : 'A comprar'}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn small remove" data-id="${it.id}">Remover</button>
          </div>`;
        furnitureList.appendChild(li);
      });
    });

    if(!any){ const el = document.createElement('li'); el.textContent='Nenhum item ainda.'; el.style.padding='10px'; furnitureList.appendChild(el); return; }

    Array.from(document.querySelectorAll('.chk')).forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const id = cb.getAttribute('data-id');
        const checked = cb.checked;
        const idx = furniture.findIndex(f=>f.id===id);
        if(idx!==-1){ furniture[idx].bought = !!checked; saveFurniture(); renderFurniture(); }
      });
    });

    Array.from(document.querySelectorAll('.remove')).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        furniture = furniture.filter(f=>f.id!==id); saveFurniture(); renderFurniture();
      });
    });

    Array.from(document.querySelectorAll('.price')).forEach(ps=>{
      ps.addEventListener('click', ()=>{
        const id = ps.getAttribute('data-id');
        const idx = furniture.findIndex(f=>f.id===id); if(idx===-1) return;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = furniture[idx].price != null ? String(furniture[idx].price) : '';
        input.className = 'price-input';
        ps.replaceWith(input);
        input.focus();

        function commit(){
          let v = input.value.trim();
          if(v === ''){ furniture[idx].price = null; }
          else{
            v = v.replace(',', '.');
            const num = parseFloat(v);
            furniture[idx].price = isNaN(num) ? null : Math.round(num*100)/100;
          }
          saveFurniture(); renderFurniture();
        }

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', e=>{ if(e.key === 'Enter'){ commit(); } if(e.key === 'Escape'){ renderFurniture(); } });
      });
    });
  }

  function addItem(name, category, price){
    const item = {id: genId(), name, bought:false, price: price != null ? price : null, priority:null, category: category || 'outros'};
    furniture.unshift(item); saveFurniture(); renderFurniture();
  }

  function addPresetsForCategory(category){
    const presets = presetsByCategory[category] || [];
    let added = 0;
    presets.forEach(p => {
      const exists = furniture.some(f => f.name.toLowerCase() === p.name.toLowerCase() && (f.category || 'outros') === category);
      if(!exists){ addItem(p.name, category, p.price); added++; }
    });
    return added;
  }

  function genId(){ return Math.random().toString(36).slice(2,9); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  function emojiForName(name){
    const n = name.toLowerCase();
    if(n.includes('geladeira')||n.includes('refrigerador')) return '🧊';
    if(n.includes('fogão')||n.includes('fogao')||n.includes('forno')) return '🔥';
    if(n.includes('sofa')||n.includes('sofá')) return '🛋️';
    if(n.includes('cama')) return '🛏️';
    if(n.includes('mesa')) return '🪑';
    return '🔸';
  }

  renderFurniture();

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', function(){
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  });

  // Toast
  function showToast(text, time = 2200){
    let t = document.getElementById('toast');
    if(!t){ t = document.createElement('div'); t.id='toast'; t.style.cssText = 'position:fixed;right:18px;bottom:18px;background:rgba(0,0,0,0.75);color:#fff;padding:10px 14px;border-radius:8px;z-index:1200;transition:opacity .25s ease;opacity:0;'; document.body.appendChild(t); }
    t.textContent = text; t.style.opacity = '1'; clearTimeout(t._timeout); t._timeout = setTimeout(()=>{ t.style.opacity = '0'; }, time);
  }

  function formatBRL(n){
    return 'R$ '+n.toLocaleString('pt-BR');
  }

  // ============================================
  // PAINEL DE FINANÇAS
  // ============================================
  const financeBtn = document.getElementById('financeBtn');
  const financePanel = document.getElementById('financePanel');
  const closeFinancePanel = document.getElementById('closeFinancePanel');
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const tabContents = Array.from(document.querySelectorAll('.tab-content'));

  financeBtn.addEventListener('click', ()=>{
    financePanel.setAttribute('aria-hidden', 'false');
    financePanel.classList.add('open');
    panelBackdrop.classList.add('visible');
    panelBackdrop.setAttribute('aria-hidden', 'false');
  });

  closeFinancePanel.addEventListener('click', ()=>{
    financePanel.setAttribute('aria-hidden', 'true');
    financePanel.classList.remove('open');
    panelBackdrop.classList.remove('visible');
    panelBackdrop.setAttribute('aria-hidden', 'true');
  });

  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tabName = btn.getAttribute('data-tab');
      tabBtns.forEach(b=>b.classList.remove('active'));
      tabContents.forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabName + '-tab').classList.add('active');
      if(tabName === 'dashboard'){
        setTimeout(()=>{ updateDashboardCharts(); }, 100);
      }
    });
  });

  panelBackdrop.addEventListener('click', ()=>{
    financePanel.setAttribute('aria-hidden', 'true');
    financePanel.classList.remove('open');
    sidePanel.setAttribute('aria-hidden', 'true');
    sidePanel.classList.remove('open');
    panelBackdrop.classList.remove('visible');
    panelBackdrop.setAttribute('aria-hidden', 'true');
  });

  // CALCULADORA
  const calcDisplay = document.getElementById('calcDisplay');
  const calcHistory = document.getElementById('calcHistory');
  const calcBtns = Array.from(document.querySelectorAll('.calc-btn-compact'));
  
  let calcInput = '0';
  let calcPrevious = '';
  let calcOperator = null;
  let calcHistory_arr = [];

  function updateCalcDisplay(){
    calcDisplay.textContent = calcInput;
  }

  calcBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const value = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if(value !== null){
        if(calcInput === '0' && value !== '.'){
          calcInput = value;
        } else if(value === '.' && calcInput.includes('.')){
          //skip
        } else {
          calcInput += value;
        }
      } else if(action === 'clear'){
        calcInput = '0';
        calcPrevious = '';
        calcOperator = null;
      } else if(action === 'delete'){
        calcInput = calcInput.slice(0, -1) || '0';
      } else if(action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide'){
        if(calcPrevious === '' && calcOperator === null){
          calcPrevious = calcInput;
          calcInput = '0';
          calcOperator = action;
        } else if(calcOperator){
          const result = performCalc(parseFloat(calcPrevious), parseFloat(calcInput), calcOperator);
          calcPrevious = String(result);
          calcInput = '0';
          calcOperator = action;
        }
      } else if(action === 'percent'){
        calcInput = String(parseFloat(calcInput) / 100);
      } else if(action === 'equals'){
        if(calcOperator && calcPrevious !== ''){
          const result = performCalc(parseFloat(calcPrevious), parseFloat(calcInput), calcOperator);
          addToCalcHistory(calcPrevious, calcInput, calcOperator, result);
          calcInput = String(result);
          calcPrevious = '';
          calcOperator = null;
        }
      }

      updateCalcDisplay();
    });
  });

  function performCalc(prev, current, op){
    switch(op){
      case 'add': return prev + current;
      case 'subtract': return prev - current;
      case 'multiply': return prev * current;
      case 'divide': return current !== 0 ? prev / current : 0;
      default: return current;
    }
  }

  function addToCalcHistory(prev, current, op, result){
    const opSymbol = {add:'+', subtract:'−', multiply:'×', divide:'÷'}[op];
    calcHistory_arr.unshift({
      expression: `${prev} ${opSymbol} ${current}`,
      result: result.toFixed(2)
    });
    if(calcHistory_arr.length > 10) calcHistory_arr.pop();
    renderCalcHistory();
  }

  function renderCalcHistory(){
    calcHistory.innerHTML = '';
    calcHistory_arr.forEach(item=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.expression} =</span> <span class="value">${item.result}</span>`;
      calcHistory.appendChild(li);
    });
  }

  // ORÇAMENTO
  const budgetNameInput = document.getElementById('budgetName');
  const budgetAmountInput = document.getElementById('budgetAmount');
  const addBudgetBtn = document.getElementById('addBudgetBtn');
  const budgetsList = document.getElementById('budgetsList');
  let budgets = loadBudgets();

  function loadBudgets(){
    try{ const raw = localStorage.getItem(budgetKey); return raw ? JSON.parse(raw) : []; }
    catch(e){ console.warn('Erro ao carregar orçamentos', e); return []; }
  }

  function saveBudgets(){
    localStorage.setItem(budgetKey, JSON.stringify(budgets));
    updateDashboardSummary();
    updateDashboardCharts();
  }

  function renderBudgets(){
    budgetsList.innerHTML = '';
    if(budgets.length === 0){
      const msg = document.createElement('p');
      msg.style.cssText = 'text-align:center;color:#07344f;padding:16px;font-size:13px';
      msg.textContent = 'Nenhum orçamento adicionado ainda.';
      budgetsList.appendChild(msg);
      return;
    }

    budgets.forEach(budget=>{
      const item = document.createElement('div');
      item.className = 'budget-item';
      const amountSpan = document.createElement('span');
      amountSpan.style.cssText = 'font-size:12px;color:#07344f;cursor:pointer;padding:4px;border-radius:4px;display:inline-block;transition:0.2s';
      amountSpan.textContent = formatBRL(budget.amount);
      amountSpan.title = 'Clique para editar';
      amountSpan.addEventListener('click', ()=>editBudgetAmount(budget));
      amountSpan.addEventListener('mouseenter', ()=>amountSpan.style.backgroundColor='rgba(13, 120, 201, 0.1)');
      amountSpan.addEventListener('mouseleave', ()=>amountSpan.style.backgroundColor='transparent');
      
      item.innerHTML = `<div><strong>${budget.name}</strong><br/></div>`;
      item.querySelector('div').appendChild(amountSpan);
      
      const actions = document.createElement('div');
      actions.className = 'budget-actions';
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-small-remove';
      removeBtn.setAttribute('data-id', budget.id);
      removeBtn.textContent = 'Remover';
      removeBtn.addEventListener('click', ()=>{
        budgets = budgets.filter(b=>b.id !== budget.id);
        saveBudgets();
        renderBudgets();
      });
      actions.appendChild(removeBtn);
      item.appendChild(actions);
      budgetsList.appendChild(item);
    });
  }

  addBudgetBtn.addEventListener('click', ()=>{
    const name = budgetNameInput.value.trim();
    const amount = parseFloat(budgetAmountInput.value);
    if(!name || isNaN(amount) || amount <= 0){
      showToast('Preencha corretamente o orçamento');
      return;
    }
    budgets.push({ id: genId(), name, amount, created: new Date().toISOString() });
    saveBudgets();
    budgetNameInput.value = '';
    budgetAmountInput.value = '';
    renderBudgets();
    showToast(`Orçamento "${name}" adicionado!`);
  });

  budgetNameInput.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') addBudgetBtn.click(); });
  renderBudgets();

  // DESPESAS
  const expenseDescInput = document.getElementById('expenseDesc');
  const expenseAmountInput = document.getElementById('expenseAmount');
  const expenseCategorySelect = document.getElementById('expenseCategory');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const expensesList = document.getElementById('expensesList');
  const expensesSummary = document.getElementById('expensesSummary');
  let expenses = loadExpenses();

  function loadExpenses(){
    try{ const raw = localStorage.getItem(expenseKey); return raw ? JSON.parse(raw) : []; }
    catch(e){ console.warn('Erro ao carregar despesas', e); return []; }
  }

  function saveExpenses(){
    localStorage.setItem(expenseKey, JSON.stringify(expenses));
    updateDashboardSummary();
    updateDashboardCharts();
  }

  function renderExpenses(){
    expensesList.innerHTML = '';
    if(expenses.length === 0){
      const msg = document.createElement('p');
      msg.style.cssText = 'text-align:center;color:#07344f;padding:16px;font-size:13px';
      msg.textContent = 'Nenhuma despesa registrada ainda.';
      expensesList.appendChild(msg);
      renderExpensesSummary();
      return;
    }

    const categoryIcons = { alimentacao: '🍎', transporte: '🚗', saude: '💊', lazer: '🎮', outros: '🔸' };
    const categoryNames = { alimentacao: 'Alimentação', transporte: 'Transporte', saude: 'Saúde', lazer: 'Lazer', outros: 'Outros' };
    const grouped = {};
    expenses.forEach(exp=>{ if(!grouped[exp.category]) grouped[exp.category] = []; grouped[exp.category].push(exp); });

    Object.keys(grouped).forEach(cat=>{
      const header = document.createElement('div');
      header.style.cssText = 'font-weight:700;color:#07344f;margin-top:8px;margin-bottom:6px;font-size:12px';
      header.textContent = `${categoryIcons[cat]} ${categoryNames[cat]}`;
      expensesList.appendChild(header);

      grouped[cat].forEach(exp=>{
        const item = document.createElement('div');
        item.className = 'expense-item';
        
        const leftDiv = document.createElement('div');
        leftDiv.innerHTML = `<strong>${exp.description}</strong><br/><span style="font-size:12px;color:#07344f">${new Date(exp.created).toLocaleDateString('pt-BR')}</span>`;
        
        const rightDiv = document.createElement('div');
        rightDiv.style.cssText = 'text-align:right';
        
        const amountDiv = document.createElement('div');
        amountDiv.style.cssText = 'font-weight:700;color:#08313a;cursor:pointer;padding:4px;border-radius:4px;display:inline-block;transition:0.2s;float:right;margin-left:8px';
        amountDiv.textContent = formatBRL(exp.amount);
        amountDiv.title = 'Clique para editar';
        amountDiv.addEventListener('click', ()=>editExpenseAmount(exp));
        amountDiv.addEventListener('mouseenter', ()=>amountDiv.style.backgroundColor='rgba(196, 30, 58, 0.1)');
        amountDiv.addEventListener('mouseleave', ()=>amountDiv.style.backgroundColor='transparent');
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-small-remove';
        removeBtn.setAttribute('data-id', exp.id);
        removeBtn.textContent = 'Remover';
        removeBtn.addEventListener('click', ()=>{
          expenses = expenses.filter(e=>e.id !== exp.id);
          saveExpenses();
          renderExpenses();
        });
        
        rightDiv.appendChild(amountDiv);
        rightDiv.appendChild(removeBtn);
        
        item.appendChild(leftDiv);
        item.appendChild(rightDiv);
        expensesList.appendChild(item);
      });
    });

    renderExpensesSummary();
  }

  function renderExpensesSummary(){
    const total = expenses.reduce((sum, exp)=>sum + exp.amount, 0);
    expensesSummary.innerHTML = total === 0 ? '<span>Total: R$ 0,00</span>' : `<span>Despesas Totais: ${formatBRL(total)}</span>`;
  }

  addExpenseBtn.addEventListener('click', ()=>{
    const desc = expenseDescInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    const category = expenseCategorySelect.value;
    if(!desc || isNaN(amount) || amount <= 0){
      showToast('Preencha corretamente a despesa');
      return;
    }
    expenses.push({ id: genId(), description: desc, amount, category, created: new Date().toISOString() });
    saveExpenses();
    expenseDescInput.value = '';
    expenseAmountInput.value = '';
    expenseCategorySelect.value = 'alimentacao';
    renderExpenses();
    showToast(`Despesa registrada: ${formatBRL(amount)}`);
  });

  expenseDescInput.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') addExpenseBtn.click(); });
  renderExpenses();

  // AQUISIÇÃO E OBRA
  const acquisitionsList = document.getElementById('acquisitionsList');
  const acquisitionSummary = document.getElementById('acquisitionSummary');
  const acqTotalPaid = document.getElementById('acqTotalPaid');
  const acqNextDue = document.getElementById('acqNextDue');
  const markAllAcqPaid = document.getElementById('markAllAcqPaid');
  const resetAcqPaid = document.getElementById('resetAcqPaid');
  const constructionList = document.getElementById('constructionList');
  const constructionProgressText = document.getElementById('constructionProgressText');
  const constructionNextDue = document.getElementById('constructionNextDue');
  const constructionProgressFill = document.getElementById('constructionProgressFill');
  const markAllConstructionPaid = document.getElementById('markAllConstructionPaid');
  const resetConstructionPaid = document.getElementById('resetConstructionPaid');

  let acquisitions = loadAcquisitions();
  let constructions = loadConstruction();

  function loadAcquisitions(){
    try{
      const raw = localStorage.getItem(acquisitionsKey);
      if(raw) return JSON.parse(raw);
      const initial = [createApartmentAcquisition()];
      localStorage.setItem(acquisitionsKey, JSON.stringify(initial));
      return initial;
    } catch(e){ console.warn('Erro ao carregar aquisições', e); return [createApartmentAcquisition()]; }
  }

  function loadConstruction(){
    try{
      const raw = localStorage.getItem(constructionKey);
      if(raw) return JSON.parse(raw);
      const initial = [createConstructionProject()];
      localStorage.setItem(constructionKey, JSON.stringify(initial));
      return initial;
    } catch(e){ console.warn('Erro ao carregar obra', e); return [createConstructionProject()]; }
  }

  function saveAcquisitions(){ localStorage.setItem(acquisitionsKey, JSON.stringify(acquisitions)); renderAcquisitions(); }
  function saveConstruction(){ localStorage.setItem(constructionKey, JSON.stringify(constructions)); renderConstruction(); }

  function createApartmentAcquisition(){
    const installments = [];
    const start = new Date(2029, 4, 20);
    for(let i = 0; i < 420; i++){
      installments.push({ number: i + 1, due: toDateString(addMonths(start, i)), amount: 1975.92, paid: false });
    }
    return { id: genId(), name: 'Apartamento - 420x de R$ 1.975,92', startDate: '2029-05-20', installments };
  }

  function createConstructionProject(){
    const installments = [];
    const start = new Date(2026, 4, 20);
    const months = 36;
    const startValue = 351.83;
    const endValue = 1789.59;
    for(let i = 0; i < months; i++){
      const amount = Number((startValue + ((endValue - startValue) * (i / (months - 1)))).toFixed(2));
      installments.push({ number: i + 1, due: toDateString(addMonths(start, i)), amount, paid: false });
    }
    return { id: genId(), name: 'Evolução de obra', startDate: '2026-05-20', endDate: '2029-04-20', installments };
  }

  function addMonths(date, count){
    const result = new Date(date);
    const d = result.getDate();
    result.setMonth(result.getMonth() + count);
    if(result.getDate() !== d){ result.setDate(0); }
    return result;
  }

  function toDateString(date){
    return date.toISOString().slice(0,10);
  }

  function formatDateBR(dateString){
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  function renderAcquisitions(){
    acquisitionsList.innerHTML = '';
    const acquisition = acquisitions[0];
    if(!acquisition){ acquisitionsList.innerHTML = '<p style="padding:16px;color:#07344f;">Nenhuma aquisição cadastrada.</p>'; return; }
    const paidCount = acquisition.installments.filter(p=>p.paid).length;
    const nextDue = acquisition.installments.find(p=>!p.paid);
    acqTotalPaid.textContent = `${paidCount} de ${acquisition.installments.length} parcelas pagas`;
    acqNextDue.textContent = nextDue ? `Próxima: ${formatDateBR(nextDue.due)}` : 'Todas pagas';
    acquisition.installments.forEach(payment=>{
      const row = document.createElement('div');
      row.className = 'payment-row';
      row.innerHTML = `
        <label class="payment-info">
          <div class="payment-label"><input type="checkbox" data-id="${payment.number}" ${payment.paid ? 'checked' : ''}> Parcela ${payment.number.toString().padStart(3,'0')}</div>
          <div class="payment-meta">Vence em ${formatDateBR(payment.due)}</div>
        </label>
        <div class="payment-amount">${formatBRL(payment.amount)}</div>
      `;
      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', ()=>{
        payment.paid = checkbox.checked;
        saveAcquisitions();
      });
      acquisitionsList.appendChild(row);
    });
  }

  function renderConstruction(){
    constructionList.innerHTML = '';
    const project = constructions[0];
    if(!project){ constructionList.innerHTML = '<p style="padding:16px;color:#07344f;">Nenhum projeto de obra cadastrado.</p>'; return; }
    const paidCount = project.installments.filter(p=>p.paid).length;
    const total = project.installments.length;
    const nextDue = project.installments.find(p=>!p.paid);
    constructionProgressText.textContent = `${paidCount} de ${total} parcelas concluídas`;
    constructionNextDue.textContent = nextDue ? `Próxima: ${formatDateBR(nextDue.due)}` : 'Todas pagas';
    constructionProgressFill.style.width = `${Math.round((paidCount / total) * 100)}%`;
    project.installments.forEach(payment=>{
      const row = document.createElement('div');
      row.className = 'payment-row';
      row.innerHTML = `
        <label class="payment-info">
          <div class="payment-label"><input type="checkbox" data-id="${payment.number}" ${payment.paid ? 'checked' : ''}> Parcela ${payment.number.toString().padStart(2,'0')}</div>
          <div class="payment-meta">Vence em ${formatDateBR(payment.due)}</div>
        </label>
        <div class="payment-amount">${formatBRL(payment.amount)}</div>
      `;
      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', ()=>{
        payment.paid = checkbox.checked;
        saveConstruction();
      });
      constructionList.appendChild(row);
    });
  }

  markAllAcqPaid.addEventListener('click', ()=>{
    acquisitions[0].installments.forEach(p=>p.paid = true);
    saveAcquisitions();
    showToast('Todas parcelas da aquisição marcadas como pagas');
  });

  resetAcqPaid.addEventListener('click', ()=>{
    acquisitions[0].installments.forEach(p=>p.paid = false);
    saveAcquisitions();
    showToast('Marcação de pagamento da aquisição limpa');
  });

  markAllConstructionPaid.addEventListener('click', ()=>{
    constructions[0].installments.forEach(p=>p.paid = true);
    saveConstruction();
    showToast('Todas parcelas da obra marcadas como pagas');
  });

  resetConstructionPaid.addEventListener('click', ()=>{
    constructions[0].installments.forEach(p=>p.paid = false);
    saveConstruction();
    showToast('Marcação de pagamento da obra limpa');
  });

  renderAcquisitions();
  renderConstruction();

  // DASHBOARD
  let expenseChart = null;
  let budgetChart = null;

  function updateDashboardSummary(){
    const totalBudget = budgets.reduce((sum, b)=>sum + b.amount, 0);
    const totalSpent = expenses.reduce((sum, e)=>sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;
    document.getElementById('totalBudget').textContent = formatBRL(totalBudget);
    document.getElementById('totalSpent').textContent = formatBRL(totalSpent);
    document.getElementById('remainingBudget').textContent = formatBRL(Math.max(0, remaining));
    const remainingEl = document.getElementById('remainingBudget');
    if(remaining < 0){ remainingEl.classList.remove('success'); remainingEl.classList.add('danger'); }
    else{ remainingEl.classList.remove('danger'); remainingEl.classList.add('success'); }
  }

  function updateDashboardCharts(){
    updateDashboardSummary();
    updateExpenseChart();
    updateBudgetChart();
    updateBudgetStatusTable();
  }

  function updateExpenseChart(){
    const categoryNames = { alimentacao: 'Alimentação', transporte: 'Transporte', saude: 'Saúde', lazer: 'Lazer', outros: 'Outros' };
    const categoryColors = { alimentacao: 'rgba(255, 107, 107, 0.8)', transporte: 'rgba(255, 195, 0, 0.8)', saude: 'rgba(76, 175, 80, 0.8)', lazer: 'rgba(156, 39, 176, 0.8)', outros: 'rgba(158, 158, 158, 0.8)' };
    const grouped = {};
    expenses.forEach(exp=>{ if(!grouped[exp.category]) grouped[exp.category] = 0; grouped[exp.category] += exp.amount; });
    const labels = Object.keys(grouped).map(k=>categoryNames[k] || k);
    const data = Object.keys(grouped).map(k=>grouped[k]);
    const colors = Object.keys(grouped).map(k=>categoryColors[k]);
    const ctx = document.getElementById('expenseChart');
    if(!ctx) return;
    if(expenseChart) expenseChart.destroy();
    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'rgba(255,255,255,0.8)', borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#07344f', font: {size: 12} } } } }
    });
  }

  function updateBudgetChart(){
    const spentByCategory = {};
    expenses.forEach(exp=>{ if(!spentByCategory[exp.category]) spentByCategory[exp.category] = 0; spentByCategory[exp.category] += exp.amount; });
    const budgetData = budgets.map(b=>({ name: b.name, amount: b.amount, spent: spentByCategory[b.name.toLowerCase()] || 0 }));
    const labels = budgetData.map(b=>b.name);
    const budgetAmount = budgetData.map(b=>b.amount);
    const spentAmount = budgetData.map(b=>b.spent);
    const ctx = document.getElementById('budgetChart');
    if(!ctx) return;
    if(budgetChart) budgetChart.destroy();
    budgetChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Orçado', data: budgetAmount, backgroundColor: 'rgba(13, 120, 201, 0.7)', borderColor: 'rgba(13, 120, 201, 1)', borderWidth: 1 },
          { label: 'Gasto', data: spentAmount, backgroundColor: 'rgba(196, 30, 58, 0.7)', borderColor: 'rgba(196, 30, 58, 1)', borderWidth: 1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { labels: { color: '#07344f', font: {size: 12} } } },
        scales: {
          y: { ticks: { color: '#07344f' }, grid: { color: 'rgba(3, 23, 33, 0.04)' } },
          x: { ticks: { color: '#07344f' }, grid: { color: 'rgba(3, 23, 33, 0.04)' } }
        }
      }
    });
  }

  function updateBudgetStatusTable(){
    const container = document.getElementById('budgetStatusTable');
    container.innerHTML = '';
    const spentByCategory = {};
    expenses.forEach(exp=>{ if(!spentByCategory[exp.category]) spentByCategory[exp.category] = 0; spentByCategory[exp.category] += exp.amount; });
    if(budgets.length === 0){
      const msg = document.createElement('p');
      msg.style.cssText = 'text-align:center;color:#07344f;padding:20px;font-size:13px';
      msg.textContent = 'Nenhum orçamento adicionado. Crie um para acompanhar suas finanças!';
      container.appendChild(msg);
      return;
    }
    budgets.forEach(budget=>{
      const spent = spentByCategory[budget.name.toLowerCase()] || 0;
      const percentage = Math.min(100, (spent / budget.amount) * 100);
      const row = document.createElement('div');
      row.className = 'budget-row';
      row.innerHTML = `
        <div class="budget-row-name">${budget.name}</div>
        <div class="budget-row-progress"><div class="budget-row-progress-fill" style="width:${percentage}%"></div></div>
        <div class="budget-row-percent">${formatBRL(spent)} / ${formatBRL(budget.amount)}</div>
      `;
      container.appendChild(row);
    });
  }

  updateDashboardCharts();

  // FUNÇÕES DE EDIÇÃO
  function editBudgetAmount(budget){
    const input = prompt(`Novo valor para "${budget.name}" (R$):`, (budget.amount / 100).toFixed(2));
    if(input === null) return;
    const newAmount = parseFloat(input.replace(',', '.'));
    if(isNaN(newAmount) || newAmount <= 0){
      showToast('Valor inválido');
      return;
    }
    budget.amount = Math.round(newAmount * 100) / 100;
    saveBudgets();
    renderBudgets();
    showToast(`Orçamento atualizado: ${formatBRL(budget.amount)}`);
  }

  function editExpenseAmount(expense){
    const input = prompt(`Novo valor para "${expense.description}" (R$):`, (expense.amount / 100).toFixed(2));
    if(input === null) return;
    const newAmount = parseFloat(input.replace(',', '.'));
    if(isNaN(newAmount) || newAmount <= 0){
      showToast('Valor inválido');
      return;
    }
    expense.amount = Math.round(newAmount * 100) / 100;
    saveExpenses();
    renderExpenses();
    showToast(`Despesa atualizada: ${formatBRL(expense.amount)}`);
  }

})();
