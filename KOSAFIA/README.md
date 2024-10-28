📁 SystemArchitectureProject
├── README.md                               # 프로젝트 개요와 설명
├── 📁 browser                              # 프론트엔드 애플리케이션을 담은 폴더
│   ├── 📁 public                           # 정적 파일(HTML, 이미지 등) 폴더
│   ├── 📁 src                              # 프론트엔드 소스 코드 폴더
│   │   ├── 📁 components                   # React 컴포넌트들
│   │   ├── 📁 pages                        # 페이지 단위 컴포넌트
│   │   ├── 📁 hooks                        # 커스텀 훅 모음
│   │   ├── 📁 contexts                     # 전역 상태 관리 컨텍스트
│   │   ├── 📁 styles                       # 스타일 파일
│   │   ├── 📁 utils                        # 유틸리티 함수들
│   │   └── App.tsx                         # 메인 애플리케이션 파일
│   └── package.json                        # 브라우저 레이어의 종속성 및 스크립트 정의 파일
├── 📁 applicationLayer                     # Spring Boot 서버 애플리케이션 폴더
│   ├── 📁 config                           # 서버 설정 파일 (예: Redis, MySQL 설정)
│   ├── 📁 controllers                      # REST API 및 WebSocket 엔드포인트
│   ├── 📁 services                         # 서비스 로직
│   ├── 📁 models                           # 데이터 모델 (엔티티)
│   ├── 📁 repositories                     # 데이터베이스 관련 코드 (MyBatis, JPA 등)
│   ├── 📁 sockets                          # WebSocket 핸들러 및 설정
│   ├── 📁 cache                            # Redis 관련 캐싱 로직
│   └── 📁 resources                        # 정적 파일(React 빌드 파일 포함)
│       └── application.properties          # 애플리케이션 설정 파일
├── 📁 database                             # 데이터베이스 관련 파일
│   ├── schema.sql                          # MySQL 스키마 정의 파일
│   ├── data.sql                            # 초기 데이터 로드 파일
├── 📁 scripts                              # 배포, 빌드, 테스트 스크립트 폴더
│   └── deploy.sh                           # 배포 자동화 스크립트
└── docker-compose.yml                      # Redis, MySQL 컨테이너 설정 파일
