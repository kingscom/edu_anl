# GitHub 배포 가이드

## 📋 사전 준비사항

1. **GitHub 계정** 생성 (https://github.com)
2. **Git 설치** (https://git-scm.com/download/windows)
3. **Node.js 18+ 설치** (https://nodejs.org)

## 🚀 배포 단계

### 1단계: Git 설치 확인
```bash
git --version
```

### 2단계: GitHub 저장소 생성
1. GitHub.com에 로그인
2. 새 저장소 생성 (Repository name: `edu_anl`)
3. Public으로 설정
4. README.md 생성하지 않음 (이미 있음)

### 3단계: 로컬 Git 설정
```bash
# 프로젝트 폴더에서 실행
cd c:\workspace\edu_anl

# Git 초기화
git init

# 사용자 정보 설정 (최초 1회만)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 원격 저장소 연결 (GitHub 저장소 URL로 변경)
git remote add origin https://github.com/yourusername/edu_anl.git
```

### 4단계: 코드 업로드
```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Educational Analytics Tool"

# GitHub에 푸시
git push -u origin main
```

### 5단계: GitHub Pages 설정
1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. Source를 **GitHub Actions**로 설정

### 6단계: 자동 배포 확인
- GitHub Actions 탭에서 배포 진행 상황 확인
- 배포 완료 후 `https://yourusername.github.io/edu_anl/`에서 접속 가능

## 🔧 로컬 테스트

배포 전 로컬에서 프로덕션 빌드 테스트:

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start
```

## 📝 주의사항

1. **파일 경로**: GitHub Pages는 대소문자를 구분합니다
2. **basePath**: 프로덕션에서 `/edu_anl` 경로가 자동으로 추가됩니다
3. **이미지**: 이미지는 `unoptimized: true` 설정으로 처리됩니다
4. **API 라우트**: GitHub Pages는 서버리스 함수를 지원하지 않습니다

## 🔄 업데이트 방법

코드 수정 후 GitHub에 푸시하면 자동으로 재배포됩니다:

```bash
git add .
git commit -m "Update: 변경 내용 설명"
git push
```

## 🆘 문제 해결

### Git 설치가 안 되어 있는 경우
1. https://git-scm.com/download/windows 에서 Git 다운로드
2. 설치 후 터미널 재시작

### 권한 오류 발생 시
```bash
# GitHub 토큰 사용 또는 SSH 키 설정 필요
# Settings > Developer settings > Personal access tokens
```

### 배포 실패 시
1. GitHub Actions 탭에서 오류 로그 확인
2. package.json의 dependencies 확인
3. Next.js 설정 확인

## 📞 지원

배포 과정에서 문제가 발생하면:
1. GitHub Actions 로그 확인
2. 콘솔 에러 메시지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인

---

**성공적인 배포를 위해 각 단계를 차례대로 진행해주세요! 🎉**
