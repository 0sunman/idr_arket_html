# 01_3. [ARKET] 퍼블리싱가이드


퍼블리싱 작업환경
---
- node.js + express + ejs 환경

퍼블리싱 특이사항
---
- [글로벌사이트](https://www.arket.com/) 벤치마킹하여 작업 진행
- [글로벌사이트](https://www.arket.com/) 에서 사용하는 frontend.min.css 사용 후 frontend.renew.css 선언
- 페이지 구성요소 대부분 [Appeaser](https://p11-acc.ocd.ddns.net/pl) 에서 검색 후 인용  
- 기본폰트 : Arket Sans, Noto Sans KR
- mediaQuery 분기사이즈(글로벌사이트 기준)
  - mobile : ~ 400
  - tablet : 401 ~ 630 or 401 ~ 768
  - pc : 769 ~ 1024 or 1025 ~  
- 샵인샵 작업은 [더현대닷컴_COS](http://www.thehyundai.com/front/dpa/cosHome.thd) 벤치마킹하여 작업 진행

퍼블리싱 산출물 디렉토리 구조
---
  
  /root
  
  ├ /dev : 신규 css를 위한 sass 폴더
  
  │　└ /css_dev : 신규 css를 위한 sass 폴더

  │　　├ /base : layout 및 페이지 기본 요소에 관련한 scss 

  │　　　├ frontend_min_overwrite : frontend.min.css에서 특정 속성을 재선언하는 scss

  │　　　├ org_page_inside : 글로벌사이트에서 html에 inline 으로 선언되어 있던 css

  │　　　├ org_page_inside_overwrite : org_page_inside에서 특정 속성을 재선언하는 scss

  │　　　└ org_page_inside_sizeguide : org_page_inside에서 사이즈가이드 관련 속성을 재선언하는 scss

  │　　├ /pages : 페이지별 scss

  │　　├ /utils : scss mixin 관련 scss
  
  │　　├ frontend.renew.error.scss : error pages에서 사용하는 scss
  
  │　　└ frontend.renew.scss : 그 외 모든 pages에서 사용하는 scss
  
  ├ /dist : [official site] html 로 변환된 퍼블 산출물
  
  │　└ /ko

  ├ /dist-sis : [shop in shop(Use iFrame)] html 로 변환된 퍼블 산출물
  
  │　└ /ko
  
  ├ /dist-sis-con : [shop in shop(For iFrame)] html 로 변환된 퍼블 산출물
  
  │　└ /ko
  
  ├ /static : 퍼블 static 소스
  
  │　├ /css : scss파일로 렌더링이 완료된 신규 css
  
  │　├ /fonts : 신규 font
  
  │　├ /js : 신규 images
  
  │　├ /js : 신규 js
  
  │　└ /org : 기존 사이트(글로벌사이트) static 소스
  
  ├ /views : ejs 관련 파일

  │　└ /common : page 별 include ejs 파일

  │　└ /handlebars : handlebars ejs 파일(ex. 레이어 팝업)
  
  │　└ /pages : page 별 ejs 파일
  
  ├ app.js : express 관련 파일
  
  ├ index.html : 퍼블 마크업 리스트 html
  
  └ package.json : node.js 관련 파일


지원브라우저
---
- IE11, 엣지, 크롬, 사파리, 오페라, 파이어폭스(최신버전기준)


퍼블리싱 작업 레퍼런스
---
- UI KIT
  https://www.arket.com/en/uikit/templates.html

- UI KIT (Components)
  https://www.arket.com/en/uikit/components.html

- UI KIT (Product Listings)
  https://www.arket.com/en/uikit/components/product-listings.html

- Appeaser
  https://p11-acc.ocd.ddns.net/pl