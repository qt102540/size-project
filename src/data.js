/* 기준 물건 8종. 전부 cm 단위의 2D 실측 사각형.
   basis는 화면에 그대로 노출되는 근거 문구이며 비어 있을 수 없다.
   source: 'product'인 항목은 확인한 모델과 확인일을 basis에 남긴다. */
(function (global) {
  var SC = global.SC || (global.SC = {});

  SC.REFERENCES = [
    {
      id: 'coin500',
      name: '500원 동전',
      w: 2.65, h: 2.65,
      source: 'spec',
      basis: '한국은행 규격 · 지름 26.5mm'
    },
    {
      id: 'card',
      name: '신용카드',
      w: 8.56, h: 5.40,
      source: 'spec',
      basis: 'ISO/IEC 7810 ID-1 규격 · 85.60 × 53.98mm'
    },
    {
      id: 'bottle500',
      name: '500mL 생수병',
      w: 6.40, h: 21.00,
      source: 'typical',
      basis: '대표값 · 특정 제품의 공식 규격이 아니며 제품별 크기 차이 있음'
    },
    {
      id: 'bill10000',
      name: '만원 지폐',
      w: 14.80, h: 6.80,
      source: 'spec',
      basis: '한국은행 발행 규격 · 148 × 68mm'
    },
    {
      id: 'phone',
      name: 'iPhone 17',
      w: 7.15, h: 14.96,
      source: 'product',
      basis: 'Apple 공식 사양 · 149.6 × 71.5mm · 2026-10-08 확인'
    },
    {
      id: 'tablet',
      name: 'iPad Air 11',
      w: 17.85, h: 24.76,
      source: 'product',
      basis: 'Apple 공식 사양 · 247.6 × 178.5mm · 확인 모델 Apple M4 · 2026-10-08 확인'
    },
    {
      id: 'a4',
      name: 'A4 용지',
      w: 21.00, h: 29.70,
      source: 'spec',
      basis: 'ISO 216 규격 · 297 × 210mm'
    },
    {
      id: 'laptop13',
      name: 'MacBook Air 13',
      w: 30.41, h: 21.50,
      source: 'product',
      basis: 'Apple 공식 사양 · 덮은 상태 304.1 × 215.0mm · 확인 모델 Apple M5 · 2026-10-08 확인'
    }
  ];

  SC.DEFAULT_REF = 'a4';

  SC.findRef = function (id) {
    for (var i = 0; i < SC.REFERENCES.length; i++) {
      if (SC.REFERENCES[i].id === id) return SC.REFERENCES[i];
    }
    return null;
  };
})(window);
