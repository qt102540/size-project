/* 기준 물건 실루엣.
 *
 * 규칙 세 가지 — 이걸 어기면 "같은 축척" 약속이 깨진다.
 *   1) 좌표는 cm. viewBox가 "0 0 w h"이므로 1 단위 = 1 cm다.
 *   2) 모든 도형은 네 변에 닿는다. minX=0, minY=0, maxX=w, maxY=h.
 *   3) 획(stroke)은 선 굵기의 절반이 도형 바깥으로 나간다. 그런데 <svg>는
 *      overflow:hidden이고 viewBox가 0 0 w h에 정확히 대응하므로, 삐져나간
 *      절반은 뷰포트가 잘라낸다. 즉 칠해지는 범위는 여전히 정확히 w × h다.
 *      획 굵기는 vector-effect="non-scaling-stroke"로 축척과 무관하게 고정한다.
 *      내부 디테일은 evenodd 구멍으로 파고, 그 구멍의 윤곽도 같이 그려진다.
 *
 * 각 함수는 (w, h)를 받아 <path> 문자열을 돌려준다. 좌표는 w·h에 대한
 * 상대값으로 쓴다 — data.js의 치수가 바뀌어도 모양이 따라간다.
 */
(function (global) {
  var SC = global.SC || (global.SC = {});

  function n(v) { return Math.round(v * 1e4) / 1e4; }

  /* 사각형 */
  function rect(x, y, w, h) {
    return 'M' + n(x) + ' ' + n(y) + 'H' + n(x + w) + 'V' + n(y + h) + 'H' + n(x) + 'Z';
  }

  /* 모서리 둥근 사각형 — 호의 접점이 네 변 위에 정확히 놓인다 */
  function rrect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    if (!(r > 0)) return rect(x, y, w, h);
    var a = 'A' + n(r) + ' ' + n(r) + ' 0 0 1 ';
    return 'M' + n(x + r) + ' ' + n(y) +
      'H' + n(x + w - r) + a + n(x + w) + ' ' + n(y + r) +
      'V' + n(y + h - r) + a + n(x + w - r) + ' ' + n(y + h) +
      'H' + n(x + r) + a + n(x) + ' ' + n(y + h - r) +
      'V' + n(y + r) + a + n(x + r) + ' ' + n(y) + 'Z';
  }

  /* 원 — 지름이 곧 외곽이다 */
  function circ(cx, cy, r) {
    return 'M' + n(cx - r) + ' ' + n(cy) +
      'A' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(cx + r) + ' ' + n(cy) +
      'A' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(cx - r) + ' ' + n(cy) + 'Z';
  }

  /* d 문자열만 돌려준다. render.js가 같은 d로 '면'과 '외곽선' 두 벌을 그린다. */
  function path(d) { return d; }

  SC.SHAPES = {

    /* 동전 — 지름이 가로·세로와 같다 */
    coin500: function (w, h) {
      return path(circ(w / 2, h / 2, Math.min(w, h) / 2));
    },

    /* 신용카드 — 실제 모서리 반경 3.18mm. 구멍 하나는 IC 칩 */
    card: function (w, h) {
      return path(
        rrect(0, 0, w, h, h * 0.059) +
        rect(w * 0.105, h * 0.30, w * 0.152, h * 0.185)
      );
    },

    /* 생수병 — 뚜껑·어깨·몸통·바닥. 가로 최대폭은 몸통, 세로는 뚜껑 끝~바닥 */
    bottle500: function (w, h) {
      var cw = w * 0.41, x0 = (w - cw) / 2, x1 = (w + cw) / 2;
      var capH = h * 0.072;
      var sh = h * 0.315;                       // 어깨가 몸통 폭에 도달하는 높이
      var br = Math.min(w * 0.22, h * 0.055);   // 바닥 모서리
      var c1 = capH + (sh - capH) * 0.45;
      var c2 = capH + (sh - capH) * 0.55;
      var d =
        'M' + n(x0) + ' 0H' + n(x1) + 'V' + n(capH) +
        'C' + n(x1) + ' ' + n(c1) + ',' + n(w) + ' ' + n(c2) + ',' + n(w) + ' ' + n(sh) +
        'V' + n(h - br) +
        'C' + n(w) + ' ' + n(h - br * 0.3) + ',' + n(w - br * 0.3) + ' ' + n(h) + ',' + n(w - br) + ' ' + n(h) +
        'H' + n(br) +
        'C' + n(br * 0.3) + ' ' + n(h) + ',0 ' + n(h - br * 0.3) + ',0 ' + n(h - br) +
        'V' + n(sh) +
        'C0 ' + n(c2) + ',' + n(x0) + ' ' + n(c1) + ',' + n(x0) + ' ' + n(capH) + 'Z';
      return path(d + rect(w * 0.1, h * 0.47, w * 0.8, h * 0.19));  // 라벨 띠
    },

    /* 지폐 — 구멍 하나는 인물 메달리온 */
    bill10000: function (w, h) {
      return path(
        rrect(0, 0, w, h, h * 0.035) +
        circ(w * 0.76, h / 2, h * 0.24)
      );
    },

    /* 스마트폰 — 구멍 하나는 화면 */
    phone: function (w, h) {
      var r = w * 0.13, p = w * 0.05;
      return path(
        rrect(0, 0, w, h, r) +
        rrect(p, p, w - p * 2, h - p * 2, Math.max(0, r - p))
      );
    },

    /* 태블릿 — 구멍 하나는 화면 */
    tablet: function (w, h) {
      var r = w * 0.037, p = w * 0.052;
      return path(
        rrect(0, 0, w, h, r) +
        rrect(p, p, w - p * 2, h - p * 2, r * 0.5)
      );
    },

    /* A4 — 실제로 직사각형이다. 더할 것이 없다 */
    a4: function (w, h) {
      return path(rect(0, 0, w, h));
    },

    /* 노트북 — 덮은 상태를 위에서 본 모습.
       뒤쪽 힌지선과 앞쪽 열림 홈으로 태블릿과 구분한다 */
    laptop13: function (w, h) {
      var r = w * 0.028;
      var hinge = rect(w * 0.1, h * 0.085, w * 0.8, h * 0.014);
      var notch =
        'M' + n(w * 0.43) + ' ' + n(h) +
        'C' + n(w * 0.44) + ' ' + n(h - h * 0.04) + ',' +
              n(w * 0.56) + ' ' + n(h - h * 0.04) + ',' +
              n(w * 0.57) + ' ' + n(h) + 'Z';
      return path(rrect(0, 0, w, h, r) + hinge + notch);
    }
  };

  /* 모양이 없는 물건은 사각형으로 — 11번째가 추가돼도 깨지지 않는다 */
  SC.shapeFor = function (id, w, h) {
    var fn = SC.SHAPES[id];
    return fn ? fn(w, h) : path(rect(0, 0, w, h));
  };
})(window);
