/* 상태 + 이벤트 배선 */
(function (global) {
  var SC = global.SC;
  var R = SC.render;

  var els = {
    w: document.getElementById('w'),
    h: document.getElementById('h'),
    chips: document.getElementById('chips'),
    result: document.getElementById('result'),
    stage: document.getElementById('stage'),
    measure: document.getElementById('measure'),
    grid: document.getElementById('grid'),
    row: document.getElementById('row'),
    bar: document.getElementById('scalebar'),
    barLabel: document.getElementById('scalelabel'),
    basis: document.getElementById('basis'),
    headNum: document.getElementById('headNum'),
    specRows: document.getElementById('specRows'),
    metaScale: document.getElementById('metaScale'),
    metaGrid: document.getElementById('metaGrid'),
    metaRef: document.getElementById('metaRef')
  };

  var state = { refId: SC.DEFAULT_REF };

  function readSubject() {
    var w = parseFloat(els.w.value);
    var h = parseFloat(els.h.value);
    if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return null;
    if (w > 1000 || h > 1000) return { w: Math.min(w, 1000), h: Math.min(h, 1000), clamped: true };
    return { w: w, h: h };
  }

  function stageHeight() {
    var vh = global.innerHeight || 800;
    return Math.max(200, Math.min(460, Math.round(vh * 0.46)));
  }

  function update() {
    var reference = SC.findRef(state.refId) || SC.REFERENCES[0];
    var subject = readSubject();

    /* typical 항목은 basis 문구 자체가 대표값임을 밝히도록 규칙이 바뀌었다.
       접미사를 덧붙이면 "대표값 … · 대표값"으로 중복된다. */
    els.basis.textContent = reference.basis;
    els.metaRef.textContent = 'REF — ' + reference.name;

    if (!subject) {
      els.row.innerHTML = '';
      els.row.style.paddingLeft = '0px';
      els.grid.style.height = stageHeight() + 'px';
      els.grid.style.backgroundSize = '24px 24px';
      els.result.textContent = '가로와 세로를 0보다 큰 숫자로 입력해 주세요.';
      els.stage.classList.add('is-empty');
      els.headNum.textContent = '—';
      els.specRows.innerHTML = '';
      els.metaScale.textContent = '';
      els.metaGrid.textContent = '';
      els.barLabel.textContent = '';
      els.bar.style.width = '0px';
      return;
    }
    els.stage.classList.remove('is-empty');

    var mobile = global.innerWidth < 760;
    var gutter = mobile ? 28 : 32;   // 내 물건 왼쪽 세로 치수선 자리
    var width = els.measure.clientWidth || els.stage.clientWidth || 640;

    /* 도형 덩어리가 캔버스 폭을 꽉 채우면 밀 여백 자체가 없다.
       먼저 좌우 숨 쉴 자리를 떼어 두고, 남는 만큼을 render.js가 분배한다. */
    var inset = mobile ? Math.round(width * 0.03) : Math.min(120, Math.round(width * 0.10));

    var lay = SC.layout(subject, reference, {
      width: width - gutter - 12 - inset,
      height: stageHeight(),
      gap: mobile ? 30 : 64,
      minCol: 76     // 이름표만 들어가면 된다 (치수는 오른쪽 표가 맡는다)
    });

    /* 그린 뒤 남는 빈 공간이 없도록 캔버스 높이를 실제 도형에 맞춘다.
       축척은 이미 확정됐으므로 비율에는 영향이 없다. */
    var plotH = Math.max(140, Math.ceil(Math.max(lay.boxes[0].h, lay.boxes[1].h)));

    R.renderStage(els, subject, reference, lay, plotH, gutter);
    R.renderSpec(els, subject, reference);

    els.result.textContent = R.resultText(subject, reference) +
      (subject.clamped ? ' · 1000cm까지만 표시합니다' : '');
    els.metaScale.textContent = '1 CM = ' + R.fmtRatio(lay.scale) + ' PX';
    els.metaGrid.textContent = 'GRID ' + R.fmtRatio(lay.grid.cm) + ' CM';
    els.stage.dataset.scale = lay.scale;   // 검증용: 화면에 쓰인 유일한 축척
  }

  /* 초기화 */
  R.renderChips(els.chips, SC.REFERENCES, state.refId);

  els.chips.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'ref') {
      state.refId = e.target.value;
      update();
    }
  });
  ['input', 'change'].forEach(function (ev) {
    els.w.addEventListener(ev, update);
    els.h.addEventListener(ev, update);
  });

  var rt;
  global.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(update, 120);
  });

  update();
})(window);
