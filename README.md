# 실물 크기 비교

가로·세로 치수를 입력하면 A4 용지, 신용카드 같은 익숙한 물건과 **같은 축척으로** 나란히 그려 주는 정적 웹사이트입니다.

## 실행

```bash
# 1) 그냥 연다 (클래식 스크립트라 file:// 에서도 동작합니다)
open index.html

# 2) 서버로 열기
python3 -m http.server 8000   # → http://localhost:8000
```

## 배포 (GitHub Pages)

1. 이 폴더를 저장소 루트로 push
2. Settings → Pages → Source: `main` 브랜치 `/ (root)`
3. `https://<user>.github.io/<repo>/` 에서 열립니다

모든 경로가 상대경로라 하위 경로 배포에서도 깨지지 않습니다.

## 구조

```
index.html        유일한 화면
styles.css
src/data.js       기준 물건 8종
src/scale.js      축척 계산 (순수 함수)
src/render.js     DOM 생성
src/main.js       상태 + 이벤트
phase0/           이전 버전 보존용
```

설계 원칙과 범위는 [CLAUDE.md](./CLAUDE.md) 참고.
