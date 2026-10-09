/* DOM 생성. 축척 계산은 scale.js가 끝낸 뒤 결과만 받아 그린다. */
(function (global) {
  var SC = global.SC || (global.SC = {});

  function fmt(cm) {
    return (Math.round(cm * 10) / 10).toLocaleString('ko-KR', {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    });
  }
  function fmtRatio(r) {
    return (Math.round(r * 100) / 100).toLocaleString('ko-KR', {
      minimumFractionDigits: 0, maximumFractionDigits: 2
    });
  }
  /* px 소수 4자리까지 쓴다. 2자리면 0.005px씩 반올림되는데,
     기준 물건이 3px까지 작아지는 극단에서 그 오차가 0.2%까지 벌어진다. */
  function px(n) { return n.toFixed(4) + 'px'; }

  /* 도형 덩어리를 남는 여백의 몇 %만큼 오른쪽으로 밀지. 0.5면 완전 가운데. */
  var GROUP_SHIFT = 0.40;

  /* 받침에 따라 조사 고르기 */
  function josa(word, withBatchim, without) {
    var c = word.charCodeAt(word.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return without;
    return (c - 0xAC00) % 28 ? withBatchim : without;
  }

  /* 칩 목록 (네이티브 라디오 — 방향키 이동이 공짜로 따라온다) */
  function renderChips(el, refs, selectedId) {
    var html = '';
    for (var i = 0; i < refs.length; i++) {
      var r = refs[i];
      var checked = r.id === selectedId ? ' checked' : '';
      html +=
        '<label class="chip">' +
          '<input type="radio" name="ref" value="' + r.id + '"' + checked + '>' +
          '<span class="chip-face">' +
            '<span class="chip-name">' + r.name + '</span>' +
            '<span class="chip-size">' + fmt(r.w) + ' × ' + fmt(r.h) + '</span>' +
          '</span>' +
        '</label>';
    }
    el.innerHTML = html;
  }

  /* 칸 너비는 scale.js가 가정한 값(= max(박스 너비, minCol))과 똑같이 맞춘다.
     라벨이 칸보다 넓어져 레이아웃이 밀리면 "같은 축척"이 깨지기 때문이다. */
  function boxMarkup(o) {
    // o: {kind, name, w, h, bw, bh, plotH, colW, gutter}
    var isSubject = o.kind === 'subject';
    var g = isSubject ? o.gutter : 0;

    var dimV = isSubject
      ? '<span class="dim dim-v" style="height:' + px(o.bh) + '">' +
          '<i></i><i></i><b>' + fmt(o.h) + ' cm</b>' +
        '</span>'
      : '';
    var dimH = isSubject
      ? '<span class="dim dim-h" style="width:' + px(o.bw) + '">' +
          '<i></i><i></i><b>' + fmt(o.w) + ' cm</b>' +
        '</span>'
      : '';

    var label = o.name + ' 가로 ' + fmt(o.w) + ' 세로 ' + fmt(o.h) + ' 센티미터';

    /* 내 물건은 사각형, 기준 물건은 실루엣.
       어느 쪽이든 바깥 크기는 scale.js가 준 px 값 그대로다. */
    var figure;
    if (isSubject) {
      figure = '<div class="box" style="width:' + px(o.bw) + ';height:' + px(o.bh) + '"' +
               ' role="img" aria-label="' + label + '"></div>';
    } else {
      /* 같은 d로 면과 외곽선을 두 벌 그린다.
         획의 바깥 절반은 <svg>의 뷰포트가 잘라내므로 칠해지는 범위는 w × h 그대로다. */
      var d = SC.shapeFor(o.id, o.w, o.h);
      figure = '<svg class="shape" width="' + px(o.bw) + '" height="' + px(o.bh) + '"' +
          ' viewBox="0 0 ' + o.w + ' ' + o.h + '" preserveAspectRatio="none"' +
          ' data-w="' + o.w + '" data-h="' + o.h + '"' +
          ' role="img" aria-label="' + label + '">' +
          '<g class="geom">' +
            '<path class="sil-fill" fill-rule="evenodd" d="' + d + '"/>' +
            '<path class="sil-line" fill-rule="evenodd" d="' + d + '"' +
              ' vector-effect="non-scaling-stroke"/>' +
          '</g>' +
        '</svg>';
    }

    return '' +
      '<div class="col ' + o.kind + '" style="width:' + px(o.colW + g) + '">' +
        '<div class="inner" style="width:' + px(o.colW) + ';margin-left:' + px(g) + '">' +
          '<div class="plot" style="height:' + px(o.plotH) + '">' +
            dimV +
            figure +
          '</div>' +
          dimH +
          '<div class="cap"><span class="cap-name">' + o.name + '</span></div>' +
        '</div>' +
      '</div>';
  }

  /* 비교 캔버스 */
  function renderStage(els, subject, reference, lay, plotH, gutter) {
    els.grid.style.height = px(plotH);
    els.grid.style.backgroundSize = px(lay.grid.px) + ' ' + px(lay.grid.px);

    var colW = [
      Math.max(lay.boxes[0].w, lay.minCol),
      Math.max(lay.boxes[1].w, lay.minCol)
    ];

    /* 두 도형을 한 덩어리로 보고 남는 여백의 일부만큼 오른쪽으로 민다.
       가운데 정렬이 아니라 40:60 — 왼쪽 벽에 붙지 않으면서 비대칭은 남긴다.
       남는 여백 안에서만 움직이므로 축척도, 도형 간격도, 바닥선도 그대로다. */
    var contentW = colW[0] + gutter + lay.gap + colW[1];
    var free = Math.max(0, (els.measure.clientWidth || 0) - contentW);
    els.row.style.paddingLeft = px(free * GROUP_SHIFT);

    els.row.style.gap = px(lay.gap);
    els.row.innerHTML =
      boxMarkup({
        kind: 'subject', name: '내 물건', w: subject.w, h: subject.h,
        bw: lay.boxes[0].w, bh: lay.boxes[0].h,
        plotH: plotH, colW: colW[0], gutter: gutter
      }) +
      boxMarkup({
        kind: 'reference', id: reference.id, name: reference.name, w: reference.w, h: reference.h,
        bw: lay.boxes[1].w, bh: lay.boxes[1].h,
        plotH: plotH, colW: colW[1], gutter: gutter
      });

    els.bar.style.width = px(lay.bar.px);
    els.barLabel.textContent = fmtRatio(lay.bar.cm) + ' cm';
  }

  /* 결과 문장 — 화면에도, 스크린리더에도 같은 내용이 간다 */
  function resultText(subject, reference) {
    var rw = subject.w / reference.w;
    var rh = subject.h / reference.h;
    var ra = (subject.w * subject.h) / (reference.w * reference.h);
    var near = rw >= 0.98 && rw <= 1.02 && rh >= 0.98 && rh <= 1.02;
    if (near) {
      return fmt(subject.w) + ' × ' + fmt(subject.h) + ' cm — ' +
             reference.name + josa(reference.name, '과', '와') + ' 거의 같은 크기입니다';
    }
    return fmt(subject.w) + ' × ' + fmt(subject.h) + ' cm — ' + reference.name + ' 대비 ' +
           '가로 ' + fmtRatio(rw) + '배 · 세로 ' + fmtRatio(rh) + '배 · 넓이 ' + fmtRatio(ra) + '배';
  }

  /* 결과 표 — 화면에 보이는 출력.
     같은 내용의 문장은 resultText가 aria-live 영역으로 따로 나간다 */
  function specRow(k, v, cls) {
    return '<tr' + (cls ? ' class="' + cls + '"' : '') + '>' +
             '<th scope="row">' + k + '</th><td>' + v + '</td></tr>';
  }
  function renderSpec(els, subject, reference) {
    var rw = subject.w / reference.w;
    var rh = subject.h / reference.h;
    var ra = (subject.w * subject.h) / (reference.w * reference.h);
    els.headNum.textContent = '×' + fmtRatio(ra);
    els.specRows.innerHTML =
      specRow('내 물건', fmt(subject.w) + ' × ' + fmt(subject.h), 'is-subject') +
      specRow(reference.name, fmt(reference.w) + ' × ' + fmt(reference.h), '') +
      specRow('가로', '×' + fmtRatio(rw), 'ratio') +
      specRow('세로', '×' + fmtRatio(rh), 'ratio');
  }

  SC.render = {
    fmt: fmt,
    fmtRatio: fmtRatio,
    renderChips: renderChips,
    renderStage: renderStage,
    renderSpec: renderSpec,
    resultText: resultText
  };
})(window);
