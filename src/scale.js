/* 축척 계산. DOM을 모른다 — 숫자가 들어가서 숫자가 나온다.
   두 사각형은 반드시 같은 scale 하나만 곱해서 그린다. */
(function (global) {
  var SC = global.SC || (global.SC = {});

  var GAP = 56;      // 두 칸 사이 간격(px). 축척과 무관한 고정값
  var MIN_COL = 84;  // 라벨이 들어갈 최소 칸 너비(px)
  var GRID_STEPS = [0.5, 1, 2, 5, 10, 20, 50, 100];
  var GRID_MIN_PX = 24;

  /* 격자 한 칸: 화면에서 GRID_MIN_PX 이상이 되는 가장 작은 눈금 */
  function niceGrid(scale) {
    for (var i = 0; i < GRID_STEPS.length; i++) {
      if (GRID_STEPS[i] * scale >= GRID_MIN_PX) {
        return { cm: GRID_STEPS[i], px: GRID_STEPS[i] * scale };
      }
    }
    var last = GRID_STEPS[GRID_STEPS.length - 1];
    return { cm: last, px: last * scale };
  }

  /* 축척 막대: 40~180px 사이에 들어오는 1·2·5 계열 눈금 */
  function niceBar(scale, target) {
    var t = target || 120;
    var raw = t / scale;
    var e = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var m = raw / e;
    var cm = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e;
    return { cm: cm, px: cm * scale };
  }

  /**
   * @param {{w:number,h:number}} subject   내 물건 (cm)
   * @param {{w:number,h:number}} reference 기준 물건 (cm)
   * @param {{width:number,height:number,gap?:number,minCol?:number}} viewport (px)
   * @returns {{scale:number,gap:number,boxes:Array<{w:number,h:number}>,grid:object,bar:object}}
   */
  function layout(subject, reference, viewport) {
    var gap = viewport.gap == null ? GAP : viewport.gap;
    var minCol = viewport.minCol == null ? MIN_COL : viewport.minCol;
    var items = [subject, reference];

    var sumW = subject.w + reference.w;
    var maxH = Math.max(subject.h, reference.h);
    var availW = Math.max(40, viewport.width - gap);
    var availH = Math.max(40, viewport.height);

    if (!(sumW > 0) || !(maxH > 0)) {
      return { scale: 0, gap: gap, boxes: [{ w: 0, h: 0 }, { w: 0, h: 0 }],
               grid: { cm: 1, px: 0 }, bar: { cm: 1, px: 0 } };
    }

    var scale = Math.min(availW / sumW, availH / maxH);

    /* 라벨이 사각형보다 넓어 폭이 모자라면 축척을 낮춰 재수렴.
       사각형 하나만 따로 줄이거나 키우지 않는다. */
    for (var pass = 0; pass < 6; pass++) {
      var used = 0, flexCm = 0, fixedPx = 0;
      for (var i = 0; i < items.length; i++) {
        var px = items[i].w * scale;
        if (px < minCol) { used += minCol; fixedPx += minCol; }
        else { used += px; flexCm += items[i].w; }
      }
      if (used <= availW || flexCm === 0) break;
      scale = Math.max(1e-6, (availW - fixedPx) / flexCm);
    }

    return {
      scale: scale,
      gap: gap,
      minCol: minCol,
      boxes: [
        { w: subject.w * scale, h: subject.h * scale },
        { w: reference.w * scale, h: reference.h * scale }
      ],
      grid: niceGrid(scale),
      bar: niceBar(scale)
    };
  }

  SC.layout = layout;
  SC.niceGrid = niceGrid;
  SC.niceBar = niceBar;
})(window);
