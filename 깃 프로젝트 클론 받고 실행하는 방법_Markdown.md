<h2>순서</h2>

1. 깃 클론 레포지토리

2. browser 어플리케이션 npm start 확인

3. browser 어플리케이션의 build - deploy

4. gameapp 어플리케이션의 gradle 클린 빌드

5. gameapp 어플리케이션의 spring boot run 확인

<hr>
<hr>
<hr>

<h2>깃 클론 레포지토리</h2>

vscode 나 인텔리제이를 쓸경우 자체 깃(혹은 익스텐션)의 성능이 우수하여 쉬움 예제 링크 \
[https://bba-jin.tistory.com/50](https://bba-jin.tistory.com/50) \
 \
 
<hr>
<hr>
<hr>


<h2>browser 어플리케이션 npm start </h2>\
 \
리액트 라이브러리가 싱글로 잘 작동하는지 확인

1. 컴퓨터에 nodejs 가 깔려 있어야함.

2. nodemodules는 깃 이그노어 대상임. nodemodules를 설치하기 위해 browser 위치에서 npm insall 을 한번 실행해줌.

3. 이후 npm start

4. 기본은 되어 있으니 이상한 이슈는 각자 해결

<hr>
<hr>
<hr>


<h2>browser 어플리케이션의 build - deploy</h2>

리액트 어플리케이션에서 코드를 수정작업했다면 게임어플리케이션에 탑승 시켜야함.

1. browser 위치에서 npm build

2. browser 위치에 있는 deploy.bat 파일 실행

1)   ==>> 브라우저(리액트)에서 내가 리액트 수정 후 스프링쪽 적용을 하고싶다
   => 브라우저(리액트) 터미널(powershell) ->./deploy



<hr>
<hr>
<hr>



<h2>gameapp 어플리케이션의 gradle 클린 빌드</h2>

applicationlayer 안에 gameapp으로 들어가면 스프링부트 스타터로 생성한 게임앱이 있음.

1. JDK 설정 확인 (17버전이 잘 세팅 되어 있다면 넘어가세요) \
 \
jdk 17이 java-home으로 세팅 되어 있다면, 혹은 IDE가 jdk17을 인식할수 있는 상태라면(이 부분이 뭔지 모르겠으면 검색 아니면 아래 링크 참고)

제일 쉬운 방법 : 그냥 java17을 한번 더 설치한다.

 \
조금 올드한 방법 : [https://velog.io/@newlysyl1107/Gradle-build-%EC%8B%9C-JVM-%EB%B2%84%EC%A0%84-%EC%88%98%EC%A0%95%ED%95%98%EA%B8%B0](https://velog.io/@newlysyl1107/Gradle-build-%EC%8B%9C-JVM-%EB%B2%84%EC%A0%84-%EC%88%98%EC%A0%95%ED%95%98%EA%B8%B0) \
 \
여러 sdk 세팅 vscode (인텔리제이도 원리는 같다) \
[https://proni.tistory.com/80](https://proni.tistory.com/80)

---
@@@@ gameapp 위치에서 ./gradlew clean build 입력


<hr>
<hr>
<hr>


<h2>gameapp 어플리케이션의 spring boot run 확인</h2>

1. gameapp 위치에서 ./gradlew bootRun 입력

2. 아니면 스프링부트 대시보드 이용.
<hr>
<hr>
<hr>
---
   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
<h2>[ 파일 수정 후 ]</h2>
1. 브라우저(리액트) 터미널(powershell) ->./deploy   //지정된 경로를 찾을 수 없습니다. ==>무시
<br>
2. gameapp 위치에서 ./gradlew clean build 입력
==> 스프링부트 대시보드 다시실행 ㄱㄱ 
